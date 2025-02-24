from rest_framework import viewsets, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
import requests
from .models import Todo, Subsidy, CompanyProfile, SubsidyEligibilityCheck
from .serializers import (
    TodoSerializer, 
    SubsidySerializer, 
    CompanyProfileSerializer, 
    SubsidyEligibilityCheckSerializer
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
