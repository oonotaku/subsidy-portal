from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Todo(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Subsidy(models.Model):
    subsidy_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=500)
    name = models.CharField(max_length=100, null=True, blank=True)  # 補助金番号
    subsidy_max_limit = models.BigIntegerField(null=True, blank=True)  # 上限金額
    subsidy_rate = models.CharField(max_length=100, null=True, blank=True)  # 補助率
    target_area_search = models.CharField(max_length=100, null=True, blank=True)  # 補助対象地域
    acceptance_start_datetime = models.DateTimeField(null=True, blank=True)
    acceptance_end_datetime = models.DateTimeField(null=True, blank=True)
    target_number_of_employees = models.CharField(max_length=100, null=True, blank=True)
    detail = models.TextField(null=True, blank=True)
    acceptance_status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['acceptance_status']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return self.title 

class CompanyProfile(models.Model):
    """企業プロフィール"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    representative = models.CharField(max_length=100)
    established_date = models.DateField()
    capital_amount = models.BigIntegerField()  # 資本金
    employee_count = models.IntegerField()  # 従業員数
    industry_type = models.CharField(max_length=100)  # 業種
    postal_code = models.CharField(max_length=8)
    address = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SubsidyEligibilityCheck(models.Model):
    """補助金適格性チェック"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company_profile = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE)
    
    # 事業計画の基本情報
    project_title = models.CharField(max_length=200)  # 事業計画名
    project_type = models.CharField(max_length=100)  # 事業類型
    investment_amount = models.BigIntegerField()  # 投資予定額
    
    # 加点項目
    is_innovation = models.BooleanField(default=False)  # 革新的な取組
    is_digital = models.BooleanField(default=False)  # デジタル技術の活用
    has_sustainability = models.BooleanField(default=False)  # サステナビリティ
    
    # 判定結果
    is_eligible = models.BooleanField(null=True)  # 適格性
    max_subsidy_amount = models.BigIntegerField(null=True)  # 最大補助金額
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class BusinessPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    eligibility_check = models.OneToOneField(SubsidyEligibilityCheck, on_delete=models.CASCADE)
    status = models.CharField(max_length=20)  # 作成状況
    content = models.JSONField()  # 計画内容
    ai_feedback = models.JSONField(null=True)  # AIからのフィードバック
    is_premium = models.BooleanField(default=False)  # 課金ユーザー判定 