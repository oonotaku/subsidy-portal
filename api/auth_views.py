from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from allauth.account.models import EmailConfirmation, EmailAddress
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
import requests
from .models import Subsidy
from .serializers import SubsidySerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """ユーザー登録API"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'メールアドレスとパスワードを入力してください'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ユーザーが既に存在するかチェック
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'このメールアドレスは既に登録されています'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ユーザーを作成
        user = User.objects.create_user(
            username=email,  # usernameにもemailを設定
            email=email,
            password=password,
            is_active=False  # メール確認まではアカウントを無効に
        )
        
        # メールアドレスを作成
        email_address = EmailAddress.objects.create(
            user=user,
            email=email,
            primary=True,
            verified=False
        )
        
        # 確認メールを送信
        confirmation = EmailConfirmation.create(email_address)
        confirmation.send()
        
        return Response({
            'message': '登録が完了しました。確認メールをご確認ください。'
        })
    except Exception as e:
        print(f"Registration error: {str(e)}")  # エラーログを追加
        return Response(
            {'error': f'登録中にエラーが発生しました: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """メール確認API"""
    key = request.data.get('key')
    print(f"Received verification key: {key}")
    
    try:
        confirmation = EmailConfirmation.objects.get(key=key)
        print(f"Found confirmation object: {confirmation}")
        
        # メール確認を実行
        confirmation.confirm(request)
        
        # ユーザーをアクティブ化
        user = confirmation.email_address.user
        user.is_active = True
        user.save()
        
        return Response({'message': 'メールアドレスの確認が完了しました'})
    except EmailConfirmation.DoesNotExist:
        print("Confirmation not found")
        return Response(
            {'error': '無効な確認キーです'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Verification error: {str(e)}")
        return Response(
            {'error': f'確認中にエラーが発生しました: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """ログインAPI"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    print(f"Login attempt for email: {email}")  # デバッグログ追加
    
    if not email or not password:
        return Response(
            {'error': 'メールアドレスとパスワードを入力してください'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # メールアドレスが確認済みかチェック
    email_address = EmailAddress.objects.filter(email=email).first()
    print(f"Found email address: {email_address}")  # デバッグログ追加
    if not email_address or not email_address.verified:
        return Response(
            {'error': 'メールアドレスが未確認です'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=email, password=password)
    print(f"Authenticated user: {user}")  # デバッグログ追加
    if not user:
        return Response(
            {'error': 'メールアドレスまたはパスワードが正しくありません'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # トークンを生成または取得
    token, _ = Token.objects.get_or_create(user=user)
    
    # ログイン時に補助金データを同期
    try:
        response = requests.get(
            "https://api.jgrants-portal.go.jp/exp/v1/public/subsidy",  # subsidiesをsubsidyに変更
            headers={
                "Accept": "application/json"
            },
            params={
                "status": 1,
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
            print(f"Successfully synced {len(data.get('result', []))} subsidies during login")
    except Exception as e:
        print(f"Sync error during login: {str(e)}")
        # 同期エラーはログインの成功に影響させない
    
    return Response({
        'token': token.key,
        'email': user.email
    })

@api_view(['POST'])
def logout(request):
    """ログアウトAPI"""
    # トークンを削除
    if request.auth:
        request.auth.delete()
    return Response({'message': 'ログアウトしました'}) 