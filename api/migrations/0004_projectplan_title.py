# Generated by Django 5.1.6 on 2025-03-03 05:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_projectplan_is_deleted'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectplan',
            name='title',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
