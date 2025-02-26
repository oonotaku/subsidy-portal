# Generated by Django 5.1.6 on 2025-02-26 01:49

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_companyprofile_capital_amount_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='projectplan',
            options={},
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='application',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='business_plan_file',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='expected_outcome',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='implementation_period',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='implementation_system',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='innovation_point',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='investment_amount',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='market_research',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='name',
        ),
        migrations.RemoveField(
            model_name='projectplan',
            name='summary',
        ),
        migrations.AddField(
            model_name='projectplan',
            name='is_premium',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='projectplan',
            name='status',
            field=models.CharField(choices=[('draft', '下書き'), ('in_progress', '作成中'), ('completed', '完了'), ('reviewing', 'AI分析中')], default='draft', max_length=20),
        ),
        migrations.AddField(
            model_name='projectplan',
            name='title',
            field=models.CharField(default='新規事業計画書', max_length=200),
        ),
        migrations.AddField(
            model_name='projectplan',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
