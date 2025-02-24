from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.utils import timezone

User = get_user_model()

class Todo(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    company_name = models.CharField("会社名", max_length=100)  # 必須
    representative = models.CharField("代表者名", max_length=100)  # 必須
    established_date = models.DateField("設立日", null=True, blank=True)  # 任意
    postal_code = models.CharField("郵便番号", max_length=8, null=True, blank=True)  # 任意
    address = models.CharField("住所", max_length=200, null=True, blank=True)  # 任意
    phone_number = models.CharField("電話番号", max_length=15)  # 必須
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "企業プロフィール"
        verbose_name_plural = "企業プロフィール"

    def __str__(self):
        return self.company_name

class SubsidyEligibilityCheck(models.Model):
    """補助金適格性チェック"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # 基本情報
    business_type = models.CharField(max_length=20)  # 追加：事業形態
    employee_count = models.IntegerField()  # 追加：従業員数
    capital_amount = models.IntegerField()  # 追加：資本金
    industry_type = models.CharField(max_length=50)  # 追加：業種
    investment_amount = models.IntegerField()  # 投資予定額
    
    # 加点項目
    is_innovation = models.BooleanField(default=False)  # 革新的な取組
    is_digital = models.BooleanField(default=False)  # デジタル技術の活用
    has_sustainability = models.BooleanField(default=False)  # サステナビリティ
    
    # 判定結果
    is_eligible = models.BooleanField(default=False)  # 適格性
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class BusinessPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    eligibility_check = models.OneToOneField(SubsidyEligibilityCheck, on_delete=models.CASCADE)
    status = models.CharField(max_length=20)  # 作成状況
    content = models.JSONField()  # 計画内容
    ai_feedback = models.JSONField(null=True)  # AIからのフィードバック
    is_premium = models.BooleanField(default=False)  # 課金ユーザー判定
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class EligibilityCheck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    business_type = models.CharField(max_length=20)
    employee_count = models.IntegerField()
    capital_amount = models.BigIntegerField()
    industry_type = models.CharField(max_length=50)
    investment_amount = models.BigIntegerField()
    is_innovative = models.BooleanField(default=False)
    uses_digital = models.BooleanField(default=False)
    is_sustainable = models.BooleanField(default=False)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SubsidyApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    eligibility_check = models.ForeignKey(SubsidyEligibilityCheck, on_delete=models.CASCADE)
    
    # 基本情報（EligibilityCheckから引き継ぎ）
    business_type = models.CharField(max_length=20)
    employee_count = models.IntegerField()
    capital_amount = models.IntegerField()
    industry_type = models.CharField(max_length=50)
    investment_amount = models.IntegerField()
    
    # 事業計画
    project_name = models.CharField(max_length=200, blank=True)
    project_summary = models.TextField(blank=True)
    implementation_period = models.CharField(max_length=100, blank=True)
    
    # 必要書類
    business_plan = models.FileField(upload_to='business_plans/', null=True, blank=True)
    company_registry = models.FileField(upload_to='company_registries/', null=True, blank=True)
    tax_return = models.FileField(upload_to='tax_returns/', null=True, blank=True)
    other_documents = models.FileField(upload_to='other_documents/', null=True, blank=True)
    
    status = models.CharField(max_length=20, default='draft')  # draft, submitted, approved, rejected
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

class ProjectPlan(models.Model):
    """事業計画モデル"""
    application = models.ForeignKey(SubsidyApplication, on_delete=models.CASCADE, related_name='project_plans')
    name = models.CharField(max_length=200, verbose_name='事業計画名')
    summary = models.TextField(verbose_name='事業概要', blank=True)
    implementation_period = models.CharField(max_length=100, verbose_name='実施期間', blank=True)
    investment_amount = models.IntegerField(verbose_name='投資予定額')
    innovation_point = models.TextField(verbose_name='革新性ポイント', blank=True)
    market_research = models.TextField(verbose_name='市場調査', blank=True)
    implementation_system = models.TextField(verbose_name='実施体制', blank=True)
    expected_outcome = models.TextField(verbose_name='期待される成果', blank=True)
    business_plan_file = models.FileField(upload_to='project_plans/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '事業計画'
        verbose_name_plural = '事業計画一覧'

class ApplicationProgress(models.Model):
    """申請進捗管理"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    application = models.OneToOneField(SubsidyApplication, on_delete=models.CASCADE)
    
    # 進捗状況
    STATUS_CHOICES = [
        ('draft', '下書き'),
        ('in_progress', '作成中'),
        ('submitted', '申請済み'),
        ('approved', '承認済み'),
        ('rejected', '却下')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # 各ステップの完了フラグ
    company_info_completed = models.BooleanField(default=False)
    basic_info_completed = models.BooleanField(default=False)
    business_plan_completed = models.BooleanField(default=False)
    documents_completed = models.BooleanField(default=False)
    
    last_edited_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '申請進捗'
        verbose_name_plural = '申請進捗'

    def __str__(self):
        return f"{self.application.project_name or '(未設定)'} - {self.get_status_display()}" 

class ProjectQuestion(models.Model):
    """事業計画の質問テンプレート"""
    QUESTION_TYPES = [
        ('text', 'テキスト入力'),
        ('number', '数値入力'),
        ('choice', '選択式'),
        ('multi', '複数選択'),
    ]
    
    question_id = models.CharField(max_length=50, unique=True)
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    options = models.JSONField(null=True, blank=True)  # 選択式の場合の選択肢
    required = models.BooleanField(default=True)
    order = models.IntegerField()
    dependent_on = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    condition = models.JSONField(null=True, blank=True)  # 表示条件
    ai_prompt = models.TextField(null=True, blank=True)  # AI用の追加コンテキスト
    
    class Meta:
        ordering = ['order']

class ProjectAnswer(models.Model):
    """ユーザーの回答を保存"""
    project = models.ForeignKey('ProjectPlan', on_delete=models.CASCADE)
    question = models.ForeignKey(ProjectQuestion, on_delete=models.CASCADE)
    answer = models.JSONField()
    ai_feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class AIPrompt(models.Model):
    """AI用のプロンプトテンプレート"""
    name = models.CharField(max_length=100)
    prompt_template = models.TextField()
    context = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 