from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import openai
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY  # settings.pyで設定

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    answers = request.data.get('answers', {})
    
    # 回答内容を文章にまとめる
    context = f"""
    事業概要: {answers.get('business_overview', '')}
    事業の必要性: {answers.get('current_issues', '')}
    ターゲット: {answers.get('target_market', '')}
    特徴: {answers.get('unique_point', '')}
    実施計画: {answers.get('implementation_plan', '')}
    目標: {answers.get('expected_outcome', '')}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                あなたは事業計画のアドバイザーです。
                高校生が考えた事業計画について、より具体的に考えるための質問を3つ生成してください。
                質問は優しい言葉で、具体的な例を示しながら行ってください。
                """},
                {"role": "user", "content": context}
            ]
        )
        
        # 応答から質問を抽出して整形
        follow_up_questions = [
            {
                "id": f"follow_up_{i+1}",
                "text": question.strip(),
                "type": "text",
                "placeholder": "具体的に教えてください"
            }
            for i, question in enumerate(
                response.choices[0].message.content.split('\n')
                if question.strip()
            )
        ]

        return Response({"questions": follow_up_questions})

    except Exception as e:
        return Response(
            {"error": "質問の生成に失敗しました"},
            status=500
        ) 