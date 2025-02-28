from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views

router = DefaultRouter()
router.register(r'todos', views.TodoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', auth_views.register, name='register'),
    path('auth/login/', auth_views.login, name='login'),
    path('auth/logout/', auth_views.logout, name='logout'),
    path('auth/verify-email/', auth_views.verify_email, name='verify-email'),
    path('subsidies/', views.get_grants, name='get-grants'),
    path('subsidies/<str:id>/', views.get_grant_detail, name='get-grant-detail'),
    path('subsidies/export/', views.export_grants_excel, name='export-grants'),
    path('subsidies/sync/', views.sync_subsidies, name='sync-subsidies'),
    path('subsidies/check-eligibility/', views.check_subsidy_eligibility, name='check-subsidy-eligibility'),
    path('company-profile/', views.manage_company_profile, name='company_profile'),
    path('subsidy-eligibility-check/', views.check_eligibility, name='check-eligibility'),
    path('applications/', views.list_applications, name='list_applications'),
    path('applications/<int:check_id>/', views.manage_application, name='manage_application'),
    path('eligibility-check/<int:check_id>/', views.get_eligibility_result, name='eligibility_result'),
    path('create-subscription/', views.create_subscription, name='create_subscription'),
    path('projects/<int:project_id>/questions/', 
         views.get_project_questions, 
         name='get_project_questions'),
    path('project-plans/', views.list_project_plans, name='list_project_plans'),
    path('project-plans/<int:project_id>/', views.get_project_detail, name='get_project_detail'),
    path('project-plans/start/', views.start_project_plan, name='start_project_plan'),
] 