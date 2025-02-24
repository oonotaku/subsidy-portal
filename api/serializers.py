from rest_framework import serializers
from .models import Todo, Subsidy, CompanyProfile, SubsidyEligibilityCheck, BusinessPlan

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