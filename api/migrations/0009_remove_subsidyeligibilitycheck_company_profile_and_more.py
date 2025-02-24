# Generated by Django 5.1.6 on 2025-02-24 04:23

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_companyprofile_subsidyeligibilitycheck_businessplan'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subsidyeligibilitycheck',
            name='company_profile',
        ),
        migrations.RemoveField(
            model_name='subsidyeligibilitycheck',
            name='max_subsidy_amount',
        ),
        migrations.RemoveField(
            model_name='subsidyeligibilitycheck',
            name='project_title',
        ),
        migrations.RemoveField(
            model_name='subsidyeligibilitycheck',
            name='project_type',
        ),
        migrations.AddField(
            model_name='businessplan',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='businessplan',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='subsidyeligibilitycheck',
            name='business_type',
            field=models.CharField(default='individual', max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subsidyeligibilitycheck',
            name='capital_amount',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subsidyeligibilitycheck',
            name='employee_count',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subsidyeligibilitycheck',
            name='industry_type',
            field=models.CharField(default=1, max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='todo',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
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
            name='SubsidyApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_name', models.CharField(max_length=200)),
                ('project_summary', models.TextField()),
                ('implementation_period', models.CharField(max_length=100)),
                ('total_budget', models.BigIntegerField()),
                ('business_plan', models.FileField(null=True, upload_to='business_plans/')),
                ('company_registry', models.FileField(null=True, upload_to='company_docs/')),
                ('tax_return', models.FileField(null=True, upload_to='tax_docs/')),
                ('other_documents', models.FileField(null=True, upload_to='other_docs/')),
                ('has_premium_support', models.BooleanField(default=False)),
                ('status', models.CharField(default='draft', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('eligibility_check', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.eligibilitycheck')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
