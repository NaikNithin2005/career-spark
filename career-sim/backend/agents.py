import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import time

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

# Priority list of models to try
MODEL_CANDIDATES = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-flash-latest",     # Added based on available models
    "gemini-flash-lite-latest", # Added based on available models
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro-latest",
    "gemini-2.0-pro-exp-02-05" 
]

CAREER_AGENT_SYSTEM_PROMPT = """
You are an advanced AI Career Architect.
Your role is to analyze a user's detailed profile (Academic, Skills, Goals, Constraints) and generate 3 distinct career trajectories:
1. "The Standard Path": A logical, safe progression based on their current state.
2. "The Aggressive/Ambitious Path": High-risk, high-reward path aiming for top-tier roles fast.
3. "The Alternative/Niche Path": A unique path combining their specific interests (even lateral ones).

For each path, breakdown the journey into 4 phases (Foundation, Specialization, Industry Entry, Growth).
Return strictly valid JSON matching the specified schema.
"""

INSIGHTS_AGENT_PROMPT = """
You are a Career Logic Analyzer.
Analyze the user's profile data (Academics, Skills, Goals).
Identify:
1. Top 3 Strengths (e.g., "Strong Academic Record", "Relevant Tech Stack").
2. Top 3 Weaknesses/Gaps (e.g., "Low CGPA", "Missing key framework skills").
3. 3 actionable suggestions to improve BEFORE starting a career.
4. An overall "Market Readiness" score/assessment (Low/Medium/High + 1 liner reason).

Return strictly valid JSON.
"""

def get_model(model_name, response_mime_type=None):
    config = {"temperature": 0.7}
    if response_mime_type:
        config["response_mime_type"] = response_mime_type
    
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config=config
    )

def generate_profile_insights(user_data: dict):
    prompt = f"""
    Analyze this profile and provide insights:
    {json.dumps(user_data, indent=2)}
    
    Structure response as:
    {{
        "strengths": ["...", "...", "..."],
        "weaknesses": ["...", "...", "..."],
        "suggestions": ["...", "...", "..."],
        "market_readiness": "High/Medium/Low - Reason"
    }}
    """
    
    for model_name in MODEL_CANDIDATES:
        try:
            print(f"Trying model: {model_name} for Insights...")
            model = get_model(model_name, "application/json")
            chat = model.start_chat(history=[
                {"role": "user", "parts": [INSIGHTS_AGENT_PROMPT]}
            ])
            response = chat.send_message(prompt)
            return json.loads(response.text)
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            continue
            
    return {"error": "Failed to generate insights.", "strengths": [], "weaknesses": [], "suggestions": [], "market_readiness": "Unknown"}

def generate_roadmap_ai(user_data: dict):
    prompt = f"""
    Generate 3 distinct career options for:
    {json.dumps(user_data, indent=2)}
    
    Structure the response as:
    {{
      "options": [
        {{
          "option_name": "Name of path (e.g. Corporate Ladder / Startup Hustle)",
          "match_score": 85,
          "summary": "Brief explanation of why this fits.",
          "phases": [
            {{
              "title": "Phase 1: [Name]",
              "duration": "[Time]",
              "description": "[Details]",
              "skills": ["A", "B"],
              "actions": ["Do X", "Do Y"]
            }}
            ... (4 phases)
          ]
        }}
        ... (3 options)
      ]
    }}
    """
    
    for model_name in MODEL_CANDIDATES:
        try:
            print(f"Trying model: {model_name} for Roadmap...")
            model = get_model(model_name, "application/json")
            chat = model.start_chat(history=[
                {"role": "user", "parts": [CAREER_AGENT_SYSTEM_PROMPT]}
            ])
            response = chat.send_message(prompt)
            return json.loads(response.text)
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            continue
            
    return {"error": "All AI models failed to generate a roadmap. Please try again later.", "options": []}

def get_mentor_response(history: list, message: str):
    # Prepend system instruction if new chat (approximated by short history)
    # Note: History passed here is raw list of dicts.
    
    for model_name in MODEL_CANDIDATES:
        try:
            print(f"Trying model: {model_name} for Chat...")
            model = get_model(model_name) # No JSON mime type for chat
            
            # Rebuild chat session
            chat = model.start_chat(history=history)
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            with open("api_errors.log", "a") as f:
                import datetime
                f.write(f"[{datetime.datetime.now()}] Model {model_name} failed: {str(e)}\n")
            continue

    return "I'm having trouble thinking right now. I tried multiple AI brains but none responded. Please try again in a moment."
