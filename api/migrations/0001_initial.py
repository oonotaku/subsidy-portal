# Generated by Django 5.1.6 on 2025-02-28 08:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AIPrompt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('prompt_template', models.TextField()),
                ('context', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='事業計画名')),
                ('summary', models.TextField(blank=True, verbose_name='事業概要')),
                ('implementation_period', models.CharField(blank=True, max_length=100, verbose_name='実施期間')),
                ('investment_amount', models.IntegerField(verbose_name='投資予定額')),
                ('innovation_point', models.TextField(blank=True, verbose_name='革新性ポイント')),
                ('market_research', models.TextField(blank=True, verbose_name='市場調査')),
                ('implementation_system', models.TextField(blank=True, verbose_name='実施体制')),
                ('expected_outcome', models.TextField(blank=True, verbose_name='期待される成果')),
                ('business_plan_file', models.FileField(blank=True, null=True, upload_to='project_plans/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': '事業計画',
                'verbose_name_plural': '事業計画一覧',
            },
        ),
        migrations.CreateModel(
            name='Todo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('completed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='CompanyProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=100)),
                ('representative', models.CharField(max_length=100)),
                ('phone_number', models.CharField(max_length=20)),
                ('established_date', models.DateField(blank=True, null=True)),
                ('capital_amount', models.IntegerField(blank=True, null=True)),
                ('employee_count', models.IntegerField(blank=True, null=True)),
                ('industry_type', models.CharField(blank=True, max_length=100, null=True)),
                ('postal_code', models.CharField(blank=True, max_length=8, null=True)),
                ('address', models.CharField(blank=True, max_length=200, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '企業プロフィール',
                'verbose_name_plural': '企業プロフィール',
            },
        ),
        migrations.CreateModel(
            name='EligibilityCheck',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business_type', models.CharField(max_length=20)),
                ('employee_count', models.IntegerField()),
                ('capital_amount', models.BigIntegerField()),
                ('industry_type', models.CharField(max_length=50)),
                ('investment_amount', models.BigIntegerField()),
                ('is_innovative', models.BooleanField(default=False)),
                ('uses_digital', models.BooleanField(default=False)),
                ('is_sustainable', models.BooleanField(default=False)),
                ('score', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_id', models.CharField(max_length=50, unique=True)),
                ('text', models.TextField()),
                ('question_type', models.CharField(choices=[('text', 'テキスト入力'), ('number', '数値入力'), ('choice', '選択式'), ('multi', '複数選択')], max_length=10)),
                ('options', models.JSONField(blank=True, null=True)),
                ('required', models.BooleanField(default=True)),
                ('order', models.IntegerField()),
                ('condition', models.JSONField(blank=True, null=True)),
                ('ai_prompt', models.TextField(blank=True, null=True)),
                ('dependent_on', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.projectquestion')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='ProjectAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', models.JSONField()),
                ('ai_feedback', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.projectplan')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.projectquestion')),
            ],
        ),
        migrations.CreateModel(
            name='Subsidy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subsidy_id', models.CharField(max_length=100, unique=True)),
                ('title', models.CharField(max_length=500)),
                ('name', models.CharField(blank=True, max_length=100, null=True)),
                ('subsidy_max_limit', models.BigIntegerField(blank=True, null=True)),
                ('subsidy_rate', models.CharField(blank=True, max_length=100, null=True)),
                ('target_area_search', models.CharField(blank=True, max_length=100, null=True)),
                ('acceptance_start_datetime', models.DateTimeField(blank=True, null=True)),
                ('acceptance_end_datetime', models.DateTimeField(blank=True, null=True)),
                ('target_number_of_employees', models.CharField(blank=True, max_length=100, null=True)),
                ('detail', models.TextField(blank=True, null=True)),
                ('acceptance_status', models.CharField(max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'indexes': [models.Index(fields=['acceptance_status'], name='api_subsidy_accepta_ea3949_idx'), models.Index(fields=['title'], name='api_subsidy_title_b8bb8f_idx')],
            },
        ),
        migrations.CreateModel(
            name='SubsidyApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business_type', models.CharField(max_length=20)),
                ('employee_count', models.IntegerField()),
                ('capital_amount', models.IntegerField()),
                ('industry_type', models.CharField(max_length=50)),
                ('investment_amount', models.IntegerField()),
                ('project_name', models.CharField(blank=True, max_length=200)),
                ('project_summary', models.TextField(blank=True)),
                ('implementation_period', models.CharField(blank=True, max_length=100)),
                ('business_plan', models.FileField(blank=True, null=True, upload_to='business_plans/')),
                ('company_registry', models.FileField(blank=True, null=True, upload_to='company_registries/')),
                ('tax_return', models.FileField(blank=True, null=True, upload_to='tax_returns/')),
                ('other_documents', models.FileField(blank=True, null=True, upload_to='other_documents/')),
                ('status', models.CharField(default='draft', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='projectplan',
            name='application',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_plans', to='api.subsidyapplication'),
        ),
        migrations.CreateModel(
            name='ApplicationProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('draft', '下書き'), ('in_progress', '作成中'), ('submitted', '申請済み'), ('approved', '承認済み'), ('rejected', '却下')], default='draft', max_length=20)),
                ('company_info_completed', models.BooleanField(default=False)),
                ('basic_info_completed', models.BooleanField(default=False)),
                ('business_plan_completed', models.BooleanField(default=False)),
                ('documents_completed', models.BooleanField(default=False)),
                ('last_edited_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('application', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.subsidyapplication')),
            ],
            options={
                'verbose_name': '申請進捗',
                'verbose_name_plural': '申請進捗',
            },
        ),
        migrations.CreateModel(
            name='SubsidyEligibilityCheck',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business_type', models.CharField(max_length=20)),
                ('employee_count', models.IntegerField()),
                ('capital_amount', models.IntegerField()),
                ('industry_type', models.CharField(max_length=50)),
                ('investment_amount', models.IntegerField()),
                ('is_innovation', models.BooleanField(default=False)),
                ('is_digital', models.BooleanField(default=False)),
                ('has_sustainability', models.BooleanField(default=False)),
                ('is_eligible', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='subsidyapplication',
            name='eligibility_check',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.subsidyeligibilitycheck'),
        ),
        migrations.CreateModel(
            name='BusinessPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=20)),
                ('content', models.JSONField()),
                ('ai_feedback', models.JSONField(null=True)),
                ('is_premium', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('eligibility_check', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.subsidyeligibilitycheck')),
            ],
        ),
    ]
