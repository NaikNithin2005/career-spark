import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

# Use Gemini 1.5 Flash for speed and cost effectiveness in prototype
# Configure for JSON output where appropriate
genai.configure(api_key=api_key)

career_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 0.7,
        "response_mime_type": "application/json"
    }
)

mentor_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 0.7,
        # Mentor response is text/chat, not strict JSON usually, unless we want structure.
        # Removing mime_type for mentor to allow natural conversation.
    }
)

CAREER_AGENT_SYSTEM_PROMPT = """
You are the Career Agent for the Career Path Simulator.
Your role is to generate a detailed, phase-based career roadmap for a user based on their inputs.
Focus on realistic progression, skill acquisition, and industry trends.
Split the career path into 4 clear phases: Foundation, Specialization, Industry Entry, and Growth/Hiring.

Return strictly valid JSON.
"""

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
    try:
        chat = career_model.start_chat(history=[
            {"role": "user", "parts": [CAREER_AGENT_SYSTEM_PROMPT]}
        ])
        response = chat.send_message(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        return {"error": str(e), "phases": []}

def get_mentor_response(history: list, message: str):
    """
    history: list of {"role": "user"|"model", "parts": [str]}
    """
    try:
        # Prepend system instruction if new chat
        system_instruction = "You are a helpful, human-like career mentor. Be encouraging, specific, and clear."
        
        # We need to construct the chat session.
        # Gemini python lib manages history in the chat object.
        # For a stateless API, we rebuild history.
        chat = mentor_model.start_chat(history=history)
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        print(f"Error in mentor chat: {e}")
        return "I'm having trouble thinking right now. Please try again."
