from rest_framework import serializers
from .models import (
    Todo, 
    Subsidy, 
    CompanyProfile, 
    SubsidyEligibilityCheck,
    SubsidyApplication,
    ProjectQuestion,
    ProjectAnswer
)

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'title', 'completed']

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

class ProjectQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectQuestion
        fields = [
            'id',
            'question_id',
            'text',
            'question_type',
            'options',
            'required',
            'order',
            'dependent_on',
            'condition'
        ]

class ProjectAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAnswer
        fields = [
            'id',
            'project',
            'question',
            'answer',
            'ai_feedback',
            'created_at'
        ] 