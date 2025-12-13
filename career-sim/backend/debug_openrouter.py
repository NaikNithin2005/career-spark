import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_keys_raw = os.getenv("OPENROUTER_API_KEY", "")
API_KEYS = [k.strip() for k in api_keys_raw.split(",") if k.strip()]

print(f"Found {len(API_KEYS)} keys.")

MODEL = "mistralai/mistral-7b-instruct:free"

for i, key in enumerate(API_KEYS[1:2], start=1):
    masked_key = key[:10] + "..." + key[-4:] if len(key) > 14 else "INVALID"
    print(f"\nTesting Key #{i+1}: {masked_key}")
    
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=key,
    )
    
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "user", "content": "Hello, are you working?"},
            ],
        )
        print("  - Success!")
        print("  - Response:", completion.choices[0].message.content)
    except Exception as e:
        print(f"  - Failed: {e}")
        with open("error_log.txt", "w") as f:
            f.write(str(e))
