# Generated by Django 5.1.6 on 2025-02-23 04:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_subsidy_acceptance_end_datetime_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Subsidy',
        ),
        migrations.RemoveField(
            model_name='todo',
            name='created_at',
        ),
    ]
