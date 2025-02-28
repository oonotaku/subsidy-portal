from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import SubsidyEligibilityCheck, SubsidyApplication, ApplicationProgress, CompanyProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'テストデータを作成します'

    def handle(self, *args, **options):
        # ユーザーを取得（メールアドレスを修正）
        user = User.objects.get(email='test@example.com')

        # 企業プロフィールを作成
        company_profile, _ = CompanyProfile.objects.get_or_create(
            user=user,
            defaults={
                'company_name': 'テスト株式会社',
                'representative': 'テスト太郎',
                'established_date': '2020-01-01',
                'postal_code': '123-4567',
                'address': '東京都千代田区テスト1-2-3',
                'phone_number': '03-1234-5678'
            }
        )

        # 適格性チェックを作成
        eligibility_check = SubsidyEligibilityCheck.objects.create(
            user=user,
            business_type='corporation',
            employee_count=10,
            capital_amount=1000000,
            industry_type='service',
            investment_amount=5000000,
            is_eligible=True
        )

        # 申請を作成
        application = SubsidyApplication.objects.create(
            user=user,
            eligibility_check=eligibility_check,
            project_name='テストプロジェクト',
            business_type='corporation',
            employee_count=10,
            capital_amount=1000000,
            industry_type='service',
            investment_amount=5000000
        )

        # 進捗を作成
        ApplicationProgress.objects.create(
            user=user,
            application=application,
            status='draft'
        )

        self.stdout.write(self.style.SUCCESS('テストデータの作成が完了しました')) 