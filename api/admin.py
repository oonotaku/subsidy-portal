from django.contrib import admin
from .models import (
    Todo, Subsidy, CompanyProfile, 
    SubsidyEligibilityCheck, BusinessPlan,
    SubsidyApplication, ApplicationProgress,
    ProjectPlan, ProjectAnswer, ProjectQuestion
)

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ['title', 'completed', 'created_at']
    list_filter = ['completed']
    search_fields = ['title']

@admin.register(Subsidy)
class SubsidyAdmin(admin.ModelAdmin):
    list_display = ['title', 'name', 'acceptance_status', 'created_at']
    list_filter = ['acceptance_status']
    search_fields = ['title', 'name']

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'representative', 'created_at']
    search_fields = ['company_name', 'representative']

@admin.register(SubsidyEligibilityCheck)
class SubsidyEligibilityCheckAdmin(admin.ModelAdmin):
    list_display = [
        'business_type',
        'investment_amount',
        'is_eligible',
        'created_at'
    ]
    list_filter = ['is_eligible', 'created_at']
    search_fields = ['business_type']

@admin.register(BusinessPlan)
class BusinessPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'is_premium', 'created_at']
    list_filter = ['status', 'is_premium']

@admin.register(SubsidyApplication)
class SubsidyApplicationAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['project_name']

@admin.register(ProjectPlan)
class ProjectPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['id', 'user__username']

@admin.register(ProjectAnswer)
class ProjectAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'question_number', 'answer', 'created_at']
    list_filter = ['project', 'question_number']
    search_fields = ['answer']

@admin.register(ProjectQuestion)
class ProjectQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_id', 'text', 'order']
    list_filter = ['question_type']
    search_fields = ['text', 'question_id']

@admin.register(ApplicationProgress)
class ApplicationProgressAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'application', 'status', 'last_edited_at']
    list_filter = ['status']
    search_fields = ['application__project_name'] 