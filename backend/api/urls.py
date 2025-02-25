from django.urls import path
from . import views

urlpatterns = [
    # ... 他のURL patterns ...
    path('generate-questions/', views.generate_questions, name='generate-questions'),
] 