from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    def handle(self, *args, **options):
        User = get_user_model()
        test_user, created = User.objects.get_or_create(
            email='test@example.com',
            username='test@example.com',
            defaults={'is_active': True}
        )
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            Token.objects.create(user=test_user)
        
        token = Token.objects.get(user=test_user)
        self.stdout.write(f'Test user token: {token.key}') 