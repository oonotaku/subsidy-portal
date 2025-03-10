# Generated by Django 5.1.6 on 2025-02-22 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_subsidy'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subsidy',
            name='acceptance_end_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='acceptance_start_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='detail',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='subsidy_max_limit',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='subsidy_rate',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='target_area_search',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='subsidy',
            name='target_number_of_employees',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
