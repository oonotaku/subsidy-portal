from rest_framework import viewsets, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
import requests
from .models import Todo, Subsidy, CompanyProfile, SubsidyEligibilityCheck, SubsidyApplication, ApplicationProgress, ProjectPlan
from .serializers import (
    TodoSerializer, 
    SubsidySerializer, 
    CompanyProfileSerializer, 
    SubsidyEligibilityCheckSerializer,
    SubsidyApplicationSerializer
)
from django.http import HttpResponse
import pandas as pd
from datetime import datetime
from io import BytesIO
from django.core.cache import cache
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from bs4 import BeautifulSoup
import stripe
from django.conf import settings
from .services.pdf_service import check_eligibility

stripe.api_key = settings.STRIPE_SECRET_KEY

class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_grants(request):
    """補助金一覧を取得するAPI"""
    try:
        keyword = request.GET.get('keyword', '')
        acceptance = request.GET.get('status', '1')
        
        # JグランツのWebサイトをスクレイピング
        response = requests.get(
            "https://www.jgrants-portal.go.jp/subsidy/search",
            params={
                "keyword": keyword if keyword else None,
                "acceptance": acceptance
            }
        )
        
        # HTMLをパース
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 補助金情報を抽出
        subsidies = []
        for item in soup.select('.subsidy-item'):  # CSSセレクタは実際のHTMLに合わせて調整
            subsidy = {
                'id': item.get('data-id'),
                'title': item.select_one('.title').text.strip(),
                'status': acceptance,
                # ... 他のフィールドも抽出
            }
            subsidies.append(subsidy)
        
        return Response({'result': subsidies})
            
    except Exception as e:
        # エラー時はローカルDBから取得
        queryset = Subsidy.objects.all()
        if keyword:
            queryset = queryset.filter(title__icontains=keyword)
        if acceptance:
            queryset = queryset.filter(acceptance_status=acceptance)
        serializer = SubsidySerializer(queryset, many=True)
        return Response({
            'result': serializer.data
        })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_grant_detail(request, id):
    """補助金詳細を取得するAPI"""
    try:
        # キャッシュキーを生成
        cache_key = f'subsidy_detail_{id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # JグランツAPIを呼び出し
        response = requests.get(
            f"https://api.jgrants-portal.go.jp/exp/v1/public/subsidy/{id}",  # subsidiesをsubsidyに変更
            headers={
                "Accept": "application/json"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            # キャッシュに保存（有効期間: 1時間）
            cache.set(cache_key, data, timeout=3600)
            return Response(data)
        else:
            # APIエラー時はローカルDBから取得
            subsidy = Subsidy.objects.get(subsidy_id=id)  # idをsubsidy_idに変更
            serializer = SubsidySerializer(subsidy)
            return Response(serializer.data)
            
    except Subsidy.DoesNotExist:
        return Response(
            {"error": "Subsidy not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def export_grants_excel(request):
    """補助金一覧をExcelファイルとしてエクスポート"""
    try:
        subsidies = Subsidy.objects.filter(acceptance_status='1')  # statusをacceptance_statusに変更
        
        # DataFrameを作成
        df = pd.DataFrame([{
            '補助金名': s.title,
            '補助金番号': s.name,
            '上限金額': f"{s.subsidy_max_limit:,}円" if s.subsidy_max_limit else '要問合せ',
            '補助率': s.subsidy_rate or '要問合せ',
            '補助対象地域': s.target_area_search or '未定',
            '受付開始日': s.acceptance_start_datetime.strftime('%Y/%m/%d') if s.acceptance_start_datetime else '未定',
            '受付終了日': s.acceptance_end_datetime.strftime('%Y/%m/%d') if s.acceptance_end_datetime else '未定',
            '対象従業員数': s.target_number_of_employees or '指定なし',
            '登録/更新日': s.created_at.strftime('%Y/%m/%d') if s.created_at else '不明',  # created_dateをcreated_atに変更
            'URL': f"https://www.jgrants-portal.go.jp/subsidy/{s.subsidy_id}?fromList=true" if s.subsidy_id else ''  # idをsubsidy_idに変更
        } for s in subsidies])
        
        # Excelファイルを作成
        excel_file = BytesIO()
        with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='補助金一覧')
            worksheet = writer.sheets['補助金一覧']
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).apply(len).max(),
                    len(str(col))
                )
                worksheet.column_dimensions[chr(65 + idx)].width = max_length + 2
        
        excel_file.seek(0)
        
        # 現在の日時をファイル名に含める
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'補助金情報_{current_time}.xlsx'
        
        response = HttpResponse(
            excel_file.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sync_subsidies(request):
    """JグランツAPIから補助金情報を取得してDBに保存"""
    try:
        response = requests.get(
            "https://api.jgrants-portal.go.jp/exp/v1/public/subsidy",  # subsidiesをsubsidyに変更
            headers={
                "Accept": "application/json"
            },
            params={
                "status": 1,  # 文字列から数値に
                "limit": 100
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            for item in data.get('result', []):
                Subsidy.objects.update_or_create(
                    subsidy_id=item['id'],
                    defaults={
                        'title': item.get('title', ''),
                        'name': item.get('name', ''),
                        'subsidy_max_limit': item.get('subsidy_max_limit'),
                        'subsidy_rate': item.get('subsidy_rate', ''),
                        'target_area_search': item.get('target_area_search', ''),
                        'acceptance_start_datetime': item.get('acceptance_start_datetime'),
                        'acceptance_end_datetime': item.get('acceptance_end_datetime'),
                        'target_number_of_employees': item.get('target_number_of_employees', ''),
                        'acceptance_status': item.get('status', '1')
                    }
                )
            return Response({"message": f"Successfully synced {len(data.get('result', []))} subsidies"})
        else:
            return Response(
                {"error": "Failed to fetch data from jGrants API"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_payment(request):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=5000,  # 5,000円
            currency='jpy',
            payment_method_types=['card'],
            metadata={'user_id': request.user.id}
        )
        return Response({
            'clientSecret': payment_intent.client_secret
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST', 'PUT', 'GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def manage_company_profile(request):
    """企業プロフィールの管理API"""
    try:
        if request.method == 'GET':
            # ユーザーのプロフィールを取得
            try:
                profile = CompanyProfile.objects.get(user=request.user)
                serializer = CompanyProfileSerializer(profile)
                return Response(serializer.data)
            except CompanyProfile.DoesNotExist:
                return Response([], status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # 新規プロフィール作成
            serializer = CompanyProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        else:  # PUT
            # プロフィール更新
            try:
                profile = CompanyProfile.objects.get(user=request.user)
                serializer = CompanyProfileSerializer(profile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except CompanyProfile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def check_subsidy_eligibility(request):
    """補助金適格性チェックAPI"""
    try:
        # ユーザーの企業プロフィールを取得
        company_profile = CompanyProfile.objects.get(user=request.user)
        
        # プロジェクト情報を取得
        project_info = request.data
        
        # 適格性チェック
        result = check_eligibility(company_profile, project_info)
        
        if result:
            return Response(result)
        else:
            return Response(
                {"error": "適格性チェックに失敗しました"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except CompanyProfile.DoesNotExist:
        return Response(
            {"error": "企業プロフィールが未登録です"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_eligibility(request):
    data = request.data
    
    try:
        # 基本的な適格性判定
        is_eligible = False
        eligible_frames = []
        
        if data['business_type'] == 'individual':
            # 個人事業主の判定
            if int(data['employee_count']) <= 20:
                is_eligible = True
                eligible_frames.append('小規模枠')
        else:
            # 法人の判定
            if int(data['employee_count']) <= 2000 and int(data['capital_amount']) < 1000000000:
                is_eligible = True
                if int(data['employee_count']) <= 50:
                    eligible_frames.append('小規模枠')
                if int(data['employee_count']) <= 300:
                    eligible_frames.append('通常枠')
                eligible_frames.append('大規模枠')
        
        # 結果を保存
        eligibility_check = SubsidyEligibilityCheck.objects.create(
            user=request.user,
            business_type=data['business_type'],
            employee_count=data['employee_count'],
            capital_amount=data['capital_amount'],
            industry_type=data['industry_type'],
            investment_amount=data['investment_amount'],
            is_innovation=data.get('is_innovative', False),
            is_digital=data.get('uses_digital', False),
            has_sustainability=data.get('is_sustainable', False),
            is_eligible=is_eligible
        )

        # 適格性がある場合のみ申請を作成
        if is_eligible:
            # 申請を作成
            application = SubsidyApplication.objects.create(
                user=request.user,
                eligibility_check=eligibility_check,
                business_type=data['business_type'],
                employee_count=data['employee_count'],
                capital_amount=data['capital_amount'],
                industry_type=data['industry_type'],
                investment_amount=data['investment_amount']
            )

            # 進捗を作成
            ApplicationProgress.objects.create(
                user=request.user,
                application=application,
                status='draft'
            )
        
        return Response({
            'is_eligible': is_eligible,
            'eligible_frames': eligible_frames,
            'check_id': eligibility_check.id,
            'message': '基本要件を満たしています。詳細な要件を確認しましょう。' if is_eligible 
                      else '申し訳ありませんが、基本要件を満たしていません。'
        })

    except Exception as e:
        print("\nError in check_eligibility:")
        print("Error type:", type(e))
        print("Error message:", str(e))
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PATCH', 'POST'])
@permission_classes([IsAuthenticated])
def manage_application(request, check_id):
    try:
        # デバッグ用のログを追加
        print("\n=== manage_application ===")
        print("User:", request.user.email)
        print("Check ID:", check_id)
        
        # 企業プロフィールを取得
        try:
            company_profile = CompanyProfile.objects.get(user=request.user)
            print("\nCompany Profile found:", {
                'company_name': company_profile.company_name,
                'representative': company_profile.representative,
                'established_date': company_profile.established_date,
                'postal_code': company_profile.postal_code,
                'address': company_profile.address,
                'phone_number': company_profile.phone_number,
            })
        except CompanyProfile.DoesNotExist:
            print("\nCompany Profile not found for user:", request.user.email)
            return Response({'error': '企業プロフィールが未登録です'}, status=404)
        
        # 適格性チェック結果を取得
        try:
            eligibility_check = SubsidyEligibilityCheck.objects.get(
                id=check_id,
                user=request.user
            )
            print("\nEligibility Check found:", {
                'id': eligibility_check.id,
                'business_type': eligibility_check.business_type,
                'employee_count': eligibility_check.employee_count,
            })
        except SubsidyEligibilityCheck.DoesNotExist:
            print("\nEligibility Check not found for id:", check_id)
            return Response({'error': '適格性チェックデータが見つかりません'}, status=404)
        
        # 申請データを取得または作成
        application, created = SubsidyApplication.objects.get_or_create(
            eligibility_check=eligibility_check,
            user=request.user,
            defaults={
                'business_type': eligibility_check.business_type,
                'employee_count': eligibility_check.employee_count,
                'capital_amount': eligibility_check.capital_amount,
                'industry_type': eligibility_check.industry_type,
                'investment_amount': eligibility_check.investment_amount,
            }
        )
        print("Application:", "Created" if created else "Found")  # デバッグ用

        # 進捗データを取得または作成
        if created:
            ApplicationProgress.objects.create(
                user=request.user,
                application=application,
                status='draft'
            )

        if request.method == 'GET':
            try:
                # デバッグ用：各フィールドの型を確認
                print("\nDebug field types:")
                print("employee_count type:", type(application.employee_count))
                print("capital_amount type:", type(application.capital_amount))
                print("investment_amount type:", type(application.investment_amount))
                print("employee_count value:", application.employee_count)
                print("capital_amount value:", application.capital_amount)
                print("investment_amount value:", application.investment_amount)

                response_data = {
                    # 企業プロフィール情報
                    'company_name': company_profile.company_name,
                    'representative': company_profile.representative,
                    'established_date': company_profile.established_date,
                    'postal_code': company_profile.postal_code,
                    'address': company_profile.address,
                    'phone_number': company_profile.phone_number,
                    
                    # 適格性チェック情報
                    'business_type': application.business_type,
                    'employee_count': int(application.employee_count),
                    'capital_amount': int(application.capital_amount),
                    'industry_type': application.industry_type,
                    'investment_amount': int(application.investment_amount),
                    
                    # 事業計画情報
                    'project_name': application.project_name or '',
                    'project_summary': application.project_summary or '',
                    'implementation_period': application.implementation_period or '',
                    
                    # ファイル情報
                    'business_plan': application.business_plan.url if application.business_plan else None,
                    'company_registry': application.company_registry.url if application.company_registry else None,
                    'tax_return': application.tax_return.url if application.tax_return else None,
                    'other_documents': application.other_documents.url if application.other_documents else None,
                    
                    # 課金状態
                    'is_premium': False  # 一時的にFalseに固定
                }
                print("\nResponse data being sent:", response_data)
                return Response(response_data)
            except Exception as e:
                print("\nError preparing response:")
                print("Error type:", type(e))
                print("Error message:", str(e))
                print("Error details:", e.__dict__)
                raise

        elif request.method == 'PATCH':
            # 部分的な更新
            for key, value in request.data.items():
                if hasattr(application, key):
                    setattr(application, key, value)
            application.save()
            return Response({'message': '保存しました'})

        elif request.method == 'POST':
            # ファイルアップロード
            file = request.FILES.get('file')
            field_name = request.data.get('field_name')
            if file and hasattr(application, field_name):
                setattr(application, field_name, file)
                application.save()
                return Response({'message': 'ファイルを保存しました'})
            return Response({'error': 'ファイルが見つかりません'}, status=400)

    except Exception as e:
        print("\nTop level error:")
        print("Error type:", type(e))
        print("Error message:", str(e))
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_eligibility_result(request, check_id):
    """適格性チェック結果の取得"""
    try:
        check = SubsidyEligibilityCheck.objects.get(
            id=check_id,
            user=request.user
        )
        
        # 基本的な適格性判定
        is_eligible = check.is_eligible
        eligible_frames = []
        
        if check.business_type == 'individual':
            if int(check.employee_count) <= 20:
                eligible_frames.append('小規模枠')
        else:
            if int(check.employee_count) <= 2000 and int(check.investment_amount) < 1000000000:
                if int(check.employee_count) <= 50:
                    eligible_frames.append('小規模枠')
                if int(check.employee_count) <= 300:
                    eligible_frames.append('通常枠')
                eligible_frames.append('大規模枠')
        
        return Response({
            'is_eligible': is_eligible,
            'eligible_frames': eligible_frames,
            'message': '基本要件を満たしています。詳細な要件を確認しましょう。' if is_eligible 
                      else '申し訳ありませんが、基本要件を満たしていません。',
            'business_type': check.business_type,
            'employee_count': check.employee_count,
            'capital_amount': check.capital_amount,
            'industry_type': check.industry_type,
            'investment_amount': check.investment_amount
        })
        
    except SubsidyEligibilityCheck.DoesNotExist:
        return Response(
            {'error': '適格性チェックデータが見つかりません'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    try:
        application_id = request.data.get('application_id')
        print("Creating subscription for application:", application_id)  # デバッグ用
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1QvtzBB00Umg07T7P50I5FZe',
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'http://localhost:5173/application/{application_id}?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'http://localhost:5173/application/{application_id}',
            client_reference_id=str(application_id),
            customer_email=request.user.email,
            locale='ja',  # 日本語表示
            currency='jpy',  # 日本円
            allow_promotion_codes=True,  # プロモーションコードを許可
            billing_address_collection='required',  # 請求先住所を必須に
        )
        
        print("Stripe session created:", session.url)  # デバッグ用
        return Response({
            'sessionUrl': session.url
        })
        
    except Exception as e:
        print("Stripe error:", str(e))  # デバッグ用
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_applications(request):
    """ユーザーの申請一覧を取得"""
    try:
        applications = SubsidyApplication.objects.filter(
            user=request.user
        ).select_related('applicationprogress', 'eligibility_check')  # eligibility_checkも取得
        
        print("\nApplications found:", len(applications))
        
        response_data = []
        for app in applications:
            progress = getattr(app, 'applicationprogress', None)
            print(f"\nApplication {app.id}:", {
                'project_name': app.project_name,
                'progress': progress.status if progress else 'None',
                'check_id': app.eligibility_check.id if app.eligibility_check else None
            })
            
            response_data.append({
                'id': app.eligibility_check.id,  # check_idを使用
                'project_name': app.project_name or '(未設定)',
                'status': progress.status if progress else 'draft',
                'status_display': progress.get_status_display() if progress else '下書き',
                'last_edited_at': progress.last_edited_at if progress else app.updated_at,
                'created_at': app.created_at
            })
        
        return Response(response_data)
        
    except Exception as e:
        print("\nError in list_applications:")
        print("Error type:", type(e))
        print("Error message:", str(e))
        return Response(
            {'error': '申請一覧の取得に失敗しました'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_project_plans(request, application_id):
    """事業計画の管理API"""
    try:
        application = SubsidyApplication.objects.get(
            id=application_id,
            user=request.user
        )

        if request.method == 'GET':
            # 事業計画一覧を取得
            plans = ProjectPlan.objects.filter(application=application)
            data = [{
                'id': plan.id,
                'name': plan.name,
                'summary': plan.summary,
                'implementation_period': plan.implementation_period,
                'investment_amount': plan.investment_amount,
                'innovation_point': plan.innovation_point,
                'market_research': plan.market_research,
                'implementation_system': plan.implementation_system,
                'expected_outcome': plan.expected_outcome,
                'created_at': plan.created_at,
                'updated_at': plan.updated_at
            } for plan in plans]
            return Response(data)

        elif request.method == 'POST':
            # 新しい事業計画を作成
            plan = ProjectPlan.objects.create(
                application=application,
                name=request.data.get('name', '新規事業計画'),
                investment_amount=request.data.get('investment_amount', 0)
            )
            return Response({
                'id': plan.id,
                'name': plan.name,
                'message': '事業計画を作成しました'
            }, status=status.HTTP_201_CREATED)

    except SubsidyApplication.DoesNotExist:
        return Response(
            {'error': '申請が見つかりません'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print("\nError in manage_project_plans:")
        print("Error type:", type(e))
        print("Error message:", str(e))
        return Response(
            {'error': '事業計画の操作に失敗しました'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
