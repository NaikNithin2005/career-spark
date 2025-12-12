import google.generativeai as genai
import os
from langdetect import detect
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini with API key from environment variables
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

SYSTEM_PROMPT = """
You are an AI Career Mentor.

Responsibilities:
- Guide users step by step
- Explain clearly
- Personalize responses
- Ask clarifying questions
- Respond in the user's language
"""

def ask_gemini(user_message: str, context: dict):
    try:
        lang = detect(user_message)
    except:
        lang = "en"

    prompt = f"""
{SYSTEM_PROMPT}

User context:
{context}

Respond in language: {lang}

User message:
{user_message}
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
