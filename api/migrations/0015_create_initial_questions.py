import json
from django.db import migrations
from django.conf import settings
import os

def create_initial_questions(apps, schema_editor):
    ProjectQuestion = apps.get_model('api', 'ProjectQuestion')
    
    # JSONファイルからデータを読み込む
    json_file_path = os.path.join(settings.BASE_DIR, 'api', 'migrations', 'data', 'initial_questions.json')
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # 質問データを作成
    for question in data['questions']:
        ProjectQuestion.objects.create(**question)

def delete_initial_questions(apps, schema_editor):
    ProjectQuestion = apps.get_model('api', 'ProjectQuestion')
    ProjectQuestion.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0014_aiprompt_projectquestion_projectanswer'),  # 依存関係を更新
    ]

    operations = [
        migrations.RunPython(create_initial_questions, delete_initial_questions),
    ] 