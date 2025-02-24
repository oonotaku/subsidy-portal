# Generated by Django 5.1.6 on 2025-02-24 10:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_alter_subsidyapplication_business_plan_and_more'),
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
    ]
