
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

print(f"Key loaded: {api_key[:10]}..." if api_key else "Key NOT loaded")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

try:
    completion = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct:free",
        messages=[{"role": "user", "content": "Hello"}],
    )
    print("Success!")
    print(completion.choices[0].message.content)
except Exception as e:
    print(f"Failed: {e}")
