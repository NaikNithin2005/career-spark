import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Parse API Keys (comma-separated support)
api_keys_raw = os.getenv("OPENROUTER_API_KEY", "")
API_KEYS = [k.strip() for k in api_keys_raw.split(",") if k.strip()]

if not API_KEYS:
    print("Warning: OPENROUTER_API_KEY not found in environment variables.")

# Priority list of models to try
MODEL_CANDIDATES = [
    "mistralai/mistral-7b-instruct:free",
    "google/gemini-pro-1.5",
    "openai/gpt-3.5-turbo",
]

# --- Helper Function ---
def call_ai_json(system_prompt: str, user_prompt: str):
    """Call OpenRouter with JSON enforcement and Key Rotation"""
    
    # Rotation Logic: Try every key
    for key_idx, current_key in enumerate(API_KEYS):
        # Initialize Client with current key
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=current_key,
        )
        
        # Try Models with this key
        for model in MODEL_CANDIDATES:
            try:
                # print(f"Trying Key #{key_idx+1} | Model: {model}...") 
                completion = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"}, 
                )
                content = completion.choices[0].message.content
                
                # Clean Markdown if present
                if "```" in content:
                    content = content.replace("```json", "").replace("```", "").strip()
                
                return json.loads(content)
            
            except Exception as e:
                print(f"Failed (Key #{key_idx+1} | {model}): {e}")
                continue # Try next model with same key OR next key if models exhausted for this key
        
        print(f"Key #{key_idx+1} exhausted all models. Switching to next key...")
    
    # Fallback if ALL keys fail
    print("CRITICAL: All API keys and models failed.")
    return {
        "message": "System currently overloaded. Please try again later.",
        "question": "What is next?",
        "context_id": "error_fallback",
        "next_question": "System Unavailable",
        "style_feedback": {
            "clarity": "N/A",
            "confidence": "N/A",
            "tips": ["System Error - Offline"]
        }
    }
    
    # Fallback / Mock Data System
    with open("debug_agent.log", "a") as f:
        f.write("All models failed. Attempting Mock Fallback.\n")
    
    # Mock for Interview Start
    if "Technical Interviewer" in system_prompt and "Start" in system_prompt:
        return {
            "message": "Welcome to your Mock Interview (AI Unavailable). Let's begin!",
            "question": "Could you explain the difference between a Process and a Thread?",
            "context_id": "mock-123"
        }
    
    # Mock for Interview Next
    if "Technical Interviewer" in system_prompt and "Continue" in system_prompt:
        return {
             "feedback_internal": "Mock feedback: Good answer.",
             "style_feedback": {
                  "clarity": "High",
                  "confidence": "Medium",
                  "tips": ["Good use of terminology.", "Try to be more direct."]
             },
             "message": "That's correct. Moving on...",
             "next_question": "How does memory management work in this context?"
        }

    # Mock for Interview Feedback
    if "Hiring Manager" in system_prompt:
        return {
            "score": 85,
            "communication_rating": "High",
            "confidence_rating": "Medium",
            "feedback": "This is a generated mock feedback because the AI service is currently unreachable. You demonstrated good knowledge.",
            "ideal_answers": ["Thread shares memory, Process does not.", "GIL limits threads in Python."],
            "improvement_suggestions": ["Deepen understanding of OS concepts.", "Practice concise explanations."]
        }
        
    return {"error": "All AI models failed. Please try again later."}

def call_ai_chat(history: list, message: str):
    """Call OpenRouter for Chat (No JSON)"""
    # Convert history format if needed, for now assume simple list
    # OpenRouter expects {"role": "user/assistant", "content": "..."}
    
    messages = []
    # Convert incompatible history if present (simple conversion)
    try:
        for h in history:
            if "role" in h and "parts" in h: # Gemini format
                role = "assistant" if h["role"] == "model" else "user"
                # Safe access to parts
                parts = h["parts"]
                content = ""
                if isinstance(parts, list):
                    content = parts[0] if len(parts) > 0 else ""
                else:
                    content = str(parts)
                
                messages.append({"role": role, "content": content})
            else:
                messages.append(h)
    except Exception as e:
        print(f"Error processing history: {e}")
            
    messages.append({"role": "user", "content": message})

    for key_idx, current_key in enumerate(API_KEYS):
        # Initialize Client each time to rotate keys (or reuse if optimized, but here we recreate)
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=current_key,
        )

        for model in MODEL_CANDIDATES:
            try:
                print(f"Trying chat model: {model} with Key #{key_idx+1}...")
                completion = client.chat.completions.create(
                    model=model,
                    messages=messages
                )
                return completion.choices[0].message.content
            except Exception as e:
                print(f"Chat Model {model} failed with Key #{key_idx+1}: {e}")
                continue
            
    print("CRITICAL: All chat models/keys failed.")
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

# --- Skill Assessment Agents ---

ASSESSMENT_GEN_PROMPT = """
You are a Technical Interviewer & Skill Assessor.
Generate a skill assessment quiz.

Requirements:
- Questions must be scenario-based (not just definition checks).
- Provide 4 options per question.
- Indicate the index of the correct option (0-3).
- Include a brief explanation for the correct answer.

Return strictly valid JSON:
{
  "questions": [
    {
      "id": 1,
      "scenario": "...",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "..."
    }
  ]
}
"""

def generate_assessment_quiz(topic: str, difficulty: str, count: int = 5):
    prompt = f"""
    Topic: {topic}
    Difficulty: {difficulty}
    Count: {count}
    """
    return call_ai_json(ASSESSMENT_GEN_PROMPT, prompt)

ASSESSMENT_EVAL_PROMPT = """
You are a Senior Mentor.
Evaluate the user's quiz performance.

Output Requirements:
1. Calculate score (0-100).
2. Identify specific sub-topics/concepts the user is weak in based on wrong answers.
3. Recommend 3 specific learning resources (docs/courses) for those weak areas.
4. Provide a supportive but constructive summary.

Return strictly valid JSON:
{
  "score": 80,
  "summary": "...",
  "weak_areas": ["...", "..."],
  "recommendations": [
    { "title": "...", "type": "Article/Course", "link": "..." }
  ]
}
"""

def evaluate_assessment_results(topic: str, user_answers: list, quiz_data: list):
    prompt = f"""
    Topic: {topic}
    Quiz Data: {json.dumps(quiz_data)}
    User Answers: {json.dumps(user_answers)}
    """
    return call_ai_json(ASSESSMENT_EVAL_PROMPT, prompt)


ASSESSMENT_FROM_TEXT_PROMPT = """
You are a Technical Interviewer.
Generate a skill assessment quiz based STRICTLY on the provided text context.

Context:
{context_text}

Requirements:
- Generate {count} questions derived from the text.
- Questions must test understanding of the provided content.
- Provide 4 options per question.
- Indicate the index of the correct option (0-3).
- Include a brief explanation.

Return strictly valid JSON:
{
  "questions": [
    {
      "id": 1,
      "scenario": "...",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "..."
    }
  ]
}
"""

def generate_assessment_from_text(text_content: str, count: int = 10):
    # Truncate text to avoid token limits if necessary (e.g. 15k chars)
    truncated_text = text_content[:15000]
    
    prompt = f"""
    Generate {count} questions based on the above context.
    """
    
    # Pre-fill the system prompt with the context to keep it focused
    system_prompt = ASSESSMENT_FROM_TEXT_PROMPT.replace("{context_text}", truncated_text).replace("{count}", str(count))
    
    return call_ai_json(system_prompt, prompt)

# --- Interview Module Agents ---


PERSONA_PROMPTS = {
    "Friendly": "You are a supportive and encouraging HR interviewer. Be warm, helpful, and give hints if the candidate is stuck. Focus on potential.",
    "Ruthless": "You are a strict and demanding Senior Tech Lead. Interrupt if the answer is wrong. Drill deep into edge cases. Be skeptical and expect high precision.",
    "Socratic": "You are a wise Mentor using the Socratic method. NEVER give the answer. Ask 'Why?' and 'How?' recursively to guide the user to the solution."
}

INTERVIEW_START_PROMPT = """
{persona_instruction}
Start an interview for the role: {role}.
Focus: {type} (Technical/Behavioral).

Generate the first welcoming message and the FIRST question.
The question should be relevant to the role and focus.

Return strictly valid JSON:
{
  "message": "Welcome...",
  "question": "First question...",
  "context_id": "unique_id_if_needed"
}
"""

def start_interview(role: str, focus: str, persona: str = "Friendly"):
    persona_instr = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS["Friendly"])
    prompt = f"Role: {role}\nFocus: {focus}"
    system = INTERVIEW_START_PROMPT.replace("{role}", role).replace("{type}", focus).replace("{persona_instruction}", persona_instr)
    return call_ai_json(system, prompt)

INTERVIEW_NEXT_PROMPT = """
{persona_instruction}
Continue the interview.
Current Role: {role}
Previous Question: {last_question}
User Answer: {user_answer}

Analyze the user's answer.
1. valid/good?
2. follow-up needed?

Generate the NEXT question. It should adapt to the user's depth.
If the answer was weak, ask a simpler fundamental question.
If strong, ask a deeper follow-up.

Also, provide "Style Feedback" on their communication style (implied from text).
- Clarity: Is it concise or rambling?
- Confidence: Do they sound sure or hesitant?
- Tone: Professional?

Return strictly valid JSON:
{
  "feedback_internal": "Brief thought on user answer",
  "style_feedback": {
      "clarity": "High/Medium/Low",
      "confidence": "High/Medium/Low",
      "tips": ["Tip 1", "Tip 2"]
  },
  "message": "Transition phrase (e.g. 'Good point regarding X...')",
  "next_question": "The actual next question"
}
"""

def next_interview_question(role: str, history: list, last_question: str, user_answer: str, persona: str = "Friendly"):
    persona_instr = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS["Friendly"])
    prompt = f"Role: {role}\nPrevious Question: {last_question}\nUser Answer: {user_answer}"
    system = INTERVIEW_NEXT_PROMPT.replace("{role}", role).replace("{last_question}", last_question).replace("{user_answer}", user_answer).replace("{persona_instruction}", persona_instr)
    
    return call_ai_json(system, prompt)

INTERVIEW_FEEDBACK_PROMPT = """
You are a Hiring Manager.
The interview is over. Evaluate the candidate.

History:
{history}

Output Requirements:
1. Score (0-100).
2. Communication Rating (Low/Mid/High).
3. Confidence Rating (Low/Mid/High).
4. Feedback (What went well, what didn't).
5. Ideal Answers for the top 3 hardest questions asked.
6. 3 Improvement Suggestions.

Return strictly valid JSON.
"""

def end_interview(role: str, history: list):
    # History format: [{question: "", answer: ""}, ...]
    prompt = f"Role: {role}\nHistory: {json.dumps(history)}"
    return call_ai_json(INTERVIEW_FEEDBACK_PROMPT, prompt)
