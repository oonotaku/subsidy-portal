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
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'メールアドレスとパスワードを入力してください'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=email, password=password)

    if not user:
        return Response({
            'error': 'メールアドレスまたはパスワードが正しくありません'
        }, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key
    })

@api_view(['POST'])
def logout(request):
    if request.user.auth_token:
        request.user.auth_token.delete()
    return Response({'message': 'ログアウトしました'}) 