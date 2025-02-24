from django.contrib import admin
from .models import Todo, Subsidy, CompanyProfile, SubsidyEligibilityCheck, BusinessPlan

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed', 'created_at')

@admin.register(Subsidy)
class SubsidyAdmin(admin.ModelAdmin):
    list_display = ('title', 'name', 'subsidy_max_limit', 'acceptance_status')
    search_fields = ('title', 'name')

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'representative', 'industry_type', 'created_at')
    search_fields = ('company_name', 'representative')

@admin.register(SubsidyEligibilityCheck)
class SubsidyEligibilityCheckAdmin(admin.ModelAdmin):
    list_display = ('project_title', 'project_type', 'is_eligible', 'created_at')

@admin.register(BusinessPlan)
class BusinessPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'is_premium') 