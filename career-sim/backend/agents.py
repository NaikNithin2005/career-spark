import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("Warning: OPENROUTER_API_KEY not found in environment variables.")

# Initialize OpenRouter Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

# Priority list of models to try (OpenRouter IDs)
MODEL_CANDIDATES = [
    "google/gemini-2.0-flash-lite-preview-02-05:free", # Free & Fast
    "google/gemini-2.0-flash-001",
    "google/gemini-pro-1.5",
    "mistralai/mistral-7b-instruct:free",
    "openai/gpt-3.5-turbo",
]

# --- Helper Function ---
def call_ai_json(system_prompt: str, user_prompt: str):
    """Call OpenRouter with JSON enforcement"""
    for model in MODEL_CANDIDATES:
        try:
            print(f"Trying model: {model}...")
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"}, 
            )
            content = completion.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Model {model} failed: {e}")
            continue
    
    # Fallback Error
    return {"error": "All AI models failed. Please try again later."}

def call_ai_chat(history: list, message: str):
    """Call OpenRouter for Chat (No JSON)"""
    # Convert history format if needed, for now assume simple list
    # OpenRouter expects {"role": "user/assistant", "content": "..."}
    
    messages = []
    # Convert incompatible history if present (simple conversion)
    for h in history:
        if "role" in h and "parts" in h: # Gemini format
            role = "assistant" if h["role"] == "model" else "user"
            content = h["parts"][0] if isinstance(h["parts"], list) else str(h["parts"])
            messages.append({"role": role, "content": content})
        else:
            messages.append(h)
            
    messages.append({"role": "user", "content": message})

    for model in MODEL_CANDIDATES:
        try:
            print(f"Trying chat model: {model}...")
            completion = client.chat.completions.create(
                model=model,
                messages=messages
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Chat Model {model} failed: {e}")
            continue
            
    return "I'm having trouble connecting to my brain right now. Please try again."

# --- Prompts ---

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

# --- Agent Functions ---

def generate_profile_insights(user_data: dict):
    prompt = f"""
    Analyze this profile and provide insights:
    {json.dumps(user_data, indent=2)}
    
    Structure response as JSON:
    {{
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."],
        "suggestions": ["...", "..."],
        "market_readiness": "High/Medium/Low - Reason"
    }}
    """
    return call_ai_json(INSIGHTS_AGENT_PROMPT, prompt)

def generate_roadmap_ai(user_data: dict):
    prompt = f"""
    Generate 3 distinct career options for:
    {json.dumps(user_data, indent=2)}
    
    Structure the response as JSON:
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
            ]
        }}
        ]
    }}
    """
    return call_ai_json(CAREER_AGENT_SYSTEM_PROMPT, prompt)

def get_mentor_response(history: list, message: str):
    return call_ai_chat(history, message)

# --- Phase 3 Agents ---

JOB_AGENT_PROMPT = """
You are a Recruitment AI.
Based on the user's profile and selected career path, generate 3 realistic job postings they could target.
Return strict JSON:
{
  "jobs": [
    {
      "title": "...",
      "company": "...",
      "salary": "...",
      "location": "...",
      "requirements": ["...", "..."],
      "match_reason": "..."
    }
  ]
}
"""

COURSE_AGENT_PROMPT = """
You are a Learning Pathway Architect.
Recommend 3 specific courses/certifications.
Return strict JSON:
{
  "courses": [
    {
      "title": "...",
      "provider": "...",
      "duration": "...",
      "skills": ["...", "..."],
      "difficulty": "..."
    }
  ]
}
"""

RESUME_AGENT_PROMPT = """
You are an expert ATS (Applicant Tracking System) & Career Coach.
Analyze the candidate's resume text against their target career goals.
Return strict JSON:
{
  "ats_score": 75,
  "skills_found": ["...", "..."],
  "missing_keywords": ["...", "..."],
  "improvements": ["...", "..."]
}
"""

def generate_job_recommendations(user_data: dict, career_path: str):
    prompt = f"""
    User Profile: {json.dumps(user_data)}
    Selected Career Path: {career_path}
    Generate 3 relevant job postings.
    """
    return call_ai_json(JOB_AGENT_PROMPT, prompt)

def generate_course_recommendations(user_data: dict, career_path: str):
    prompt = f"""
    User Profile: {json.dumps(user_data)}
    Selected Career Path: {career_path}
    Generate 3 course recommendations to bridge skill gaps.
    """
    return call_ai_json(COURSE_AGENT_PROMPT, prompt)

def analyze_resume_text(resume_text: str, career_goal: str = "General Tech Role"):
    prompt = f"""
    Target Role/Goal: {career_goal}
    Resume Content:
    {resume_text[:10000]} 
    """
    return call_ai_json(RESUME_AGENT_PROMPT, prompt)

MARKET_AGENT_PROMPT = """
You are a Career Market Analyst.
Analyze:
1. Hiring Probability
2. Readiness Score
3. Skill Gap Analysis
4. 3 Recommended Job Roles

Return strict JSON:
{
  "hiring_probability": "Medium",
  "readiness_score": 65,
  "analysis_summary": "...",
  "critical_missing_skills": ["..."],
  "recommended_jobs": [
    {
       "title": "...",
       "company": "...",
       "location": "...",
       "match_score": 85,
       "type": "Remote/On-site"
    }
  ]
}
"""

def generate_market_insights(target_role: str, skills: list, location: str):
    prompt = f"""
    Target Role: {target_role}
    Current Skills: {", ".join(skills)}
    Location: {location}
    analyze market readiness.
    """
    return call_ai_json(MARKET_AGENT_PROMPT, prompt)

JOB_PREP_AGENT_PROMPT = """
You are a Tech Career Coach.
Provide a targeted preparation guide.
Return strict JSON:
{
  "interview_questions": [
    { "question": "...", "type": "Technical/Behavioral", "answer_tip": "..." }
  ],
  "resume_keywords": ["..."],
  "project_challenge": {
     "title": "...",
     "description": "..."
  },
  "match_summary": "..."
}
"""

def generate_job_prep(job_title: str, company: str, skills: list):
    prompt = f"""
    Job Title: {job_title}
    Company: {company}
    My Skills: {", ".join(skills)}
    Create a prep guide.
    """
    return call_ai_json(JOB_PREP_AGENT_PROMPT, prompt)

PROJECT_AGENT_PROMPT = """
You are a Senior Tech Lead.
Create a mini-implementation plan.
Return strict JSON:
{
  "tech_stack": ["..."],
  "steps": [
    {"step": 1, "title": "...", "details": "..."}
  ],
  "bonus_challenge": "..."
}
"""

def generate_project_guide(title: str, description: str):
    prompt = f"""
    Project: {title}
    Context: {description}
    """
    return call_ai_json(PROJECT_AGENT_PROMPT, prompt)

RESUME_BUILDER_PROMPT = """
Act as a Resume Writer.
Rewrite the provided details into a professional JSON resume.
Use action verbs. Keep it concise.

Return strict JSON:
{
  "summary": "2-sentence professional summary.",
  "experience": [
    { "role": "...", "company": "...", "dates": "...", "points": ["...", "..."] }
  ],
  "education": [
    { "degree": "...", "school": "...", "year": "..." }
  ],
  "skills": ["..."]
}
"""

def generate_resume_content(user_data: dict):
    prompt = f"""
    User Data: {user_data}
    """
    response = call_ai_json(RESUME_BUILDER_PROMPT, prompt)
    
    # Simple Fallback if NULL or Error
    if not response or "error" in response:
        print("Using Fallback Mock Data for Resume")
        fallback_skills = user_data.get("skills", "").split(",") if user_data.get("skills") else ["Python", "Problem Solving"]
        return {
          "summary": f"Aspiring professional with a background in {user_data.get('education', 'tech')}.",
          "experience": [
            { 
                "role": "Project Contributor", 
                "company": "Projects / Academic", 
                "dates": "Recent", 
                "points": ["Collaborated in team settings.", "Optimized workflows."] 
            }
          ],
          "education": [
            { "degree": user_data.get("education", "Degree"), "school": "University/Institute", "year": "2024" }
          ],
          "skills": fallback_skills
        }
        
    return response
