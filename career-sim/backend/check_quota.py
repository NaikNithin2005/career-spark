import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ No API Key found in .env")
    exit()

print(f"🔑 Testing API Key: {api_key[:5]}...{api_key[-5:]}\n")

genai.configure(api_key=api_key)

MODELS_TO_TEST = [
    "gemini-1.5-flash", 
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
]

print(f"Testing Key: {api_key[:10]}...")

for model_name in MODELS_TO_TEST:
    print(f"\n--- Testing {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi", request_options={"timeout": 10})
        if response.text:
            print(f"SUCCESS: {model_name} IS WORKING!")
    except Exception as e:
        print(f"FAILED: {str(e)[:100]}")
