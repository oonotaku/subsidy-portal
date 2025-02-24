from django.contrib import admin
from .models import (
    Todo, Subsidy, CompanyProfile, 
    SubsidyEligibilityCheck, BusinessPlan,
    SubsidyApplication
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