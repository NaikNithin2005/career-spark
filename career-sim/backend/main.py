from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from fastapi import File, UploadFile, Form
import pdfplumber
import io
import io
import io
from agents import generate_roadmap_ai, get_mentor_response, generate_job_recommendations, generate_course_recommendations, analyze_resume_text, generate_market_insights, generate_job_prep, generate_project_guide, generate_resume_content, generate_project_guide, generate_assessment_quiz, evaluate_assessment_results, generate_assessment_from_text, start_interview, next_interview_question, end_interview

app = FastAPI(title="Career Path Simulator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AcademicProfile(BaseModel):
    education_level: str
    stream: str = ""
    branch: str = ""
    institution_type: str = ""
    marks_10th: float = 0.0
    marks_12th: float = 0.0
    cgpa: float = 0.0

class UserProfile(BaseModel):
    name: str = "User"
    age: int = 18
    skills: List[str] = []
    interests: List[str] = []
    traits: List[str] = [] # Behavioral traits

class CareerGoals(BaseModel):
    long_term_goal: str = ""
    preferred_industry: str = ""
    preferred_location: str = ""
    constraints: str = "" # Financial, Time, etc.

class CareerInput(BaseModel):
    academics: AcademicProfile
    profile: UserProfile
    goals: CareerGoals

class InsightResponse(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    market_readiness: str

class Phase(BaseModel):
    title: str
    duration: str
    description: str
    skills: List[str]
    actions: List[str]

class CareerOption(BaseModel):
    option_name: str # e.g. "Ambitious Path", "Safe Path"
    match_score: int
    phases: List[Phase]
    summary: str

class RoadmapResponse(BaseModel):
    options: List[CareerOption]

class ChatMessage(BaseModel):
    role: str
    parts: List[str]

class ChatRequest(BaseModel):
    history: List[Dict[str, Any]]
    message: str

# --- Phase 3 Models ---
class Job(BaseModel):
    title: str
    company: str
    salary: str
    location: str
    requirements: List[str]
    match_reason: str

class Course(BaseModel):
    title: str
    provider: str
    duration: str
    skills: List[str]
    difficulty: str

class RecommendationResponse(BaseModel):
    jobs: List[Job]
    courses: List[Course]

class ResumeAnalysis(BaseModel):
    ats_score: int
    skills_found: List[str]
    missing_keywords: List[str]
    improvements: List[str]

class RecRequest(BaseModel):
    user_data: dict
    career_path: str

# --- Market Insights Models ---
class JobMatch(BaseModel):
    title: str
    company: str
    location: str
    match_score: int
    type: str

class MarketAnalysis(BaseModel):
    hiring_probability: str
    readiness_score: int
    analysis_summary: str
    critical_missing_skills: List[str]
    recommended_jobs: List[JobMatch]

class MarketInput(BaseModel):
    target_role: str
    skills: List[str]
    location: str

class JobPrepRequest(BaseModel):
    job_title: str
    company: str
    skills: List[str]

class ProjectGuideRequest(BaseModel):
    title: str
    description: str

class ResumeBuildRequest(BaseModel):
    name: str
    email: str
    phone: str
    experience: str
    education: str
    skills: str

@app.get("/")
async def root():
    return {"status": "ok", "message": "Career Path Simulator Backend is running"}

@app.post("/api/generate-insights")
async def generate_insights_endpoint(input_data: CareerInput):
    from agents import generate_profile_insights
    insights = generate_profile_insights(input_data.dict())
    if "error" in insights:
         raise HTTPException(status_code=500, detail=insights["error"])
    return insights

@app.post("/api/generate-roadmap")
async def generate_roadmap_endpoint(input_data: CareerInput):
    roadmap = generate_roadmap_ai(input_data.dict())
    if "error" in roadmap:
        raise HTTPException(status_code=500, detail=roadmap["error"])
    return roadmap

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Map 'user'/'model' roles if needed, currently assuming frontend sends correct format
    response_text = get_mentor_response(request.history, request.message)
    return {"role": "model", "parts": [response_text]}

@app.post("/api/recommendations")
async def get_recommendations(req: RecRequest):
    jobs = generate_job_recommendations(req.user_data, req.career_path)
    courses = generate_course_recommendations(req.user_data, req.career_path)
    
    return {
        "jobs": jobs.get("jobs", []),
        "courses": courses.get("courses", [])
    }

@app.post("/api/analyze-resume")
async def analyze_resume_endpoint(
    file: UploadFile = File(...), 
    career_goal: str = Form("General Tech Role")
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        # Extract text using pdfplumber
        content = await file.read()
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        
        if not text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
             
        analysis = analyze_resume_text(text, career_goal)
        if "error" in analysis:
             raise HTTPException(status_code=500, detail=analysis["error"])
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/market-insights")
async def market_insights_endpoint(input_data: MarketInput):
    try:
        insights = generate_market_insights(
            input_data.target_role, 
            input_data.skills, 
            input_data.location
        )
        if "error" in insights:
             raise HTTPException(status_code=500, detail=insights["error"])
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/job-prep")
async def job_prep_endpoint(input_data: JobPrepRequest):
    try:
        prep = generate_job_prep(
            input_data.job_title,
            input_data.company,
            input_data.skills
        )
        if "error" in prep:
             raise HTTPException(status_code=500, detail=prep["error"])
        return prep
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/project-guide")
async def project_guide_endpoint(input_data: ProjectGuideRequest):
    try:
        guide = generate_project_guide(
            input_data.title,
            input_data.description
        )
        if "error" in guide:
             raise HTTPException(status_code=500, detail=guide["error"])
        return guide
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/build-resume")
async def build_resume_endpoint(input_data: ResumeBuildRequest):
    try:
        resume = generate_resume_content(input_data.dict())
        if "error" in resume:
             raise HTTPException(status_code=500, detail=resume["error"])
        return resume
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Assessment API ---

class AssessmentGenRequest(BaseModel):
    topic: str
    difficulty: str = "Intermediate"
    count: int = 5

class AssessmentEvalRequest(BaseModel):
    topic: str
    user_answers: List[Dict[str, Any]] # e.g. [{"question_id": 1, "selected_index": 2}]
    quiz_context: List[Dict[str, Any]] # Full quiz data to avoid statefulness in backend

@app.post("/api/generate-assessment")
async def generate_assessment_endpoint(req: AssessmentGenRequest):
    from agents import generate_assessment_quiz
    quiz = generate_assessment_quiz(req.topic, req.difficulty, req.count)
    if "error" in quiz:
        raise HTTPException(status_code=500, detail=quiz["error"])
    return quiz

@app.post("/api/evaluate-assessment")
async def evaluate_assessment_endpoint(req: AssessmentEvalRequest):
    from agents import evaluate_assessment_results
    eval_result = evaluate_assessment_results(req.topic, req.user_answers, req.quiz_context)
    if "error" in eval_result:
        raise HTTPException(status_code=500, detail=eval_result["error"])
    return eval_result

@app.post("/api/generate-assessment-from-file")
async def generate_assessment_from_file(file: UploadFile = File(...), count: int = Form(10)):
    try:
        content = ""
        if file.filename.endswith(".pdf"):
            # Process PDF
            pdf_bytes = await file.read()
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        content += text + "\n"
        else:
             # Process Text/Markdown
            content_bytes = await file.read()
            content = content_bytes.decode("utf-8")
        
        if not content.strip():
             # Fallback if empty or failed extract
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        print(f"DEBUG: Extracted content length: {len(content)}")
        print(f"DEBUG: Content preview: {content[:100]}...")

        # Assuming generate_assessment_from_text is defined elsewhere, e.g., in agents.py
        from agents import generate_assessment_from_text 
        quiz = generate_assessment_from_text(content, count)
        if "error" in quiz:
            raise HTTPException(status_code=500, detail=quiz["error"])
        return quiz

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Interview Module API ---

class InterviewStartRequest(BaseModel):
    role: str
    focus: str = "Technical"

class InterviewInteractionRequest(BaseModel):
    role: str
    history: list = [] # List of {question, answer}
    last_question: str
    user_answer: str

class InterviewFeedbackRequest(BaseModel):
    role: str
    history: list # Full conversation history

@app.post("/api/start-interview")
async def api_start_interview(request: InterviewStartRequest):
    return start_interview(request.role, request.focus)

@app.post("/api/interview-interaction")
async def api_interview_interaction(request: InterviewInteractionRequest):
    return next_interview_question(request.role, request.history, request.last_question, request.user_answer)

@app.post("/api/interview-feedback")
async def api_interview_feedback(request: InterviewFeedbackRequest):
    return end_interview(request.role, request.history)



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
