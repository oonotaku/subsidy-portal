from openai import OpenAI
client = OpenAI()

def generate_business_plan(user_input):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "あなたはものづくり補助金の専門家です..."},
            {"role": "user", "content": user_input}
        ]
    )
    return response.choices[0].message.content