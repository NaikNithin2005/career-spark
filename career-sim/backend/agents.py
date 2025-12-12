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
You are the Career Agent for the Career Path Simulator.
Your role is to generate a detailed, phase-based career roadmap for a user based on their inputs.
Focus on realistic progression, skill acquisition, and industry trends.
Split the career path into 4 clear phases: Foundation, Specialization, Industry Entry, and Growth/Hiring.

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

def generate_roadmap_ai(user_data: dict):
    prompt = f"""
    Generate a career roadmap for the following user profile:
    {json.dumps(user_data, indent=2)}
    
    Structure the response as:
    {{
      "phases": [
        {{
          "title": "Phase 1: [Name]",
          "duration": "[Time period]",
          "description": "[Summary]",
          "skills": ["Skill 1", "Skill 2"],
          "actions": ["Action 1", "Action 2"]
        }}
        ... (4 phases)
      ],
      "summary": "[Overall career outlook]"
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
            # Continue to next model
            continue
            
    return {"error": "All AI models failed to generate a roadmap. Please try again later.", "phases": []}

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
            continue

    return "I'm having trouble thinking right now. I tried multiple AI brains but none responded. Please try again in a moment."
