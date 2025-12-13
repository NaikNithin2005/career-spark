
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
print(f"Loaded Key: {api_key}")


MODEL_CANDIDATES = [
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "google/gemini-2.0-flash-001",
    "google/gemini-pro-1.5",
    "mistralai/mistral-7b-instruct:free",
    "openai/gpt-3.5-turbo",
]

def test_raw():
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
         "HTTP-Referer": "http://localhost:3000",
         "X-Title": "Career Spark"
    }
    
    for model in MODEL_CANDIDATES:
        print(f"\nTesting {model}...")
        data = {
            "model": model,
            "messages": [{"role": "user", "content": "Hi"}],
        }
        try:
            resp = requests.post(url, headers=headers, json=data)
            print(f"Status Code: {resp.status_code}")
            if resp.status_code == 200:
                print("SUCCESS")
            else:
                 try:
                     print(f"Response: {json.dumps(resp.json(), indent=2)}")
                 except:
                     print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    test_raw()
