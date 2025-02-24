from rest_framework import serializers
from .models import Todo, Subsidy, CompanyProfile, SubsidyEligibilityCheck, BusinessPlan, SubsidyApplication

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = '__all__'

class SubsidySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subsidy
        fields = '__all__'

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ('user',)

class SubsidyEligibilityCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubsidyEligibilityCheck
        fields = '__all__'

class BusinessPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessPlan
        fields = '__all__'

class SubsidyApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubsidyApplication
        fields = [
            'business_type', 'employee_count', 'capital_amount',
            'industry_type', 'investment_amount', 'project_name',
            'project_summary', 'implementation_period', 'business_plan',
            'company_registry', 'tax_return', 'other_documents',
            'status'
        ] 