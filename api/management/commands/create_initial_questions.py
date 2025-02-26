from django.core.management.base import BaseCommand
from api.models import ProjectQuestion

class Command(BaseCommand):
    help = '基本的な事業計画質問を作成'

    def handle(self, *args, **options):
        questions = [
            {
                'text': 'どんなことをする事業ですか？',
                'placeholder': '例：お年寄りの方々に、スマートフォンの使い方を教える教室を開きます。',
                'order': 1,
            },
            {
                'text': 'なぜその事業が必要だと思いましたか？',
                'placeholder': '例：祖父母がスマートフォンを使いたがっているけど、使い方が分からずに困っているのを見たからです。',
                'order': 2,
            },
            {
                'text': 'どんな人に利用してもらいたいですか？',
                'placeholder': '例：スマートフォンの使い方を学びたい60歳以上の方々です。',
                'order': 3,
            },
            {
                'text': 'あなたの事業の特徴は何ですか？',
                'placeholder': '例：高校生が教えるので、ゆっくり丁寧に、分かりやすく説明できます。',
                'order': 4,
            },
            {
                'text': 'どのように事業を進めていきますか？',
                'placeholder': '例：最初は地域の公民館で月2回教室を開き、徐々に回数を増やしていきます。',
                'order': 5,
            },
            {
                'text': 'この事業で何を達成したいですか？',
                'placeholder': '例：1年間で100人のお年寄りがスマートフォンを使えるようになることを目指します。',
                'order': 6,
            },
        ]

        for question in questions:
            ProjectQuestion.objects.get_or_create(
                text=question['text'],
                defaults={
                    'placeholder': question['placeholder'],
                    'order': question['order'],
                }
            )

        self.stdout.write(self.style.SUCCESS('基本質問の作成が完了しました')) 