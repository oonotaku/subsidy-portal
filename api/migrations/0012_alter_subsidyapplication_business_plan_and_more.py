# Generated by Django 5.1.6 on 2025-02-24 07:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_applicationprogress'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subsidyapplication',
            name='business_plan',
            field=models.FileField(blank=True, null=True, upload_to='business_plans/'),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='capital_amount',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='company_registry',
            field=models.FileField(blank=True, null=True, upload_to='company_registries/'),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='implementation_period',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='investment_amount',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='other_documents',
            field=models.FileField(blank=True, null=True, upload_to='other_documents/'),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='project_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='project_summary',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='subsidyapplication',
            name='tax_return',
            field=models.FileField(blank=True, null=True, upload_to='tax_returns/'),
        ),
        migrations.AlterField(
            model_name='subsidyeligibilitycheck',
            name='capital_amount',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='subsidyeligibilitycheck',
            name='investment_amount',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='subsidyeligibilitycheck',
            name='is_eligible',
            field=models.BooleanField(default=False),
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
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_plans', to='api.subsidyapplication')),
            ],
            options={
                'verbose_name': '事業計画',
                'verbose_name_plural': '事業計画一覧',
            },
        ),
    ]
