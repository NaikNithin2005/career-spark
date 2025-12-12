import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

try:
    with open("models_utf8.txt", "w", encoding="utf-8") as f:
        f.write("Listing available models:\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
except Exception as e:
    with open("models_utf8.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}")
