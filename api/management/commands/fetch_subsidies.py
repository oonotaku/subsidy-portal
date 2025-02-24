from django.core.management.base import BaseCommand
from api.models import Subsidy
import requests
from datetime import datetime

class Command(BaseCommand):
    help = 'Fetch subsidies from jGrants API and store in DB'

    def handle(self, *args, **options):
        url = "https://api.jgrants-portal.go.jp/exp/v1/public/subsidies"
        response = requests.get(
            url,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            params={
                "keyword": "補助",
                "sort": "created_date",
                "order": "DESC",
                "acceptance": "1",
                "limit": "100"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            count = 0
            for item in data.get('result', []):
                Subsidy.objects.update_or_create(
                    subsidy_id=item['id'],
                    defaults={
                        'title': item.get('title'),
                        'name': item.get('name'),
                        'subsidy_max_limit': item.get('subsidy_max_limit'),
                        'subsidy_rate': item.get('subsidy_rate'),
                        'target_area_search': item.get('target_area_search'),
                        'acceptance_start_datetime': datetime.fromisoformat(item.get('acceptance_start_datetime', '').replace('Z', '+00:00')) if item.get('acceptance_start_datetime') else None,
                        'acceptance_end_datetime': datetime.fromisoformat(item.get('acceptance_end_datetime', '').replace('Z', '+00:00')) if item.get('acceptance_end_datetime') else None,
                        'target_number_of_employees': item.get('target_number_of_employees'),
                        'detail': item.get('detail', ''),
                        'acceptance_status': item.get('acceptance', '1')
                    }
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched {count} subsidies'))
        else:
            self.stdout.write(
                self.style.ERROR(
                    f'Failed to fetch subsidies: {response.status_code}\nResponse: {response.text}'
                )
            ) 