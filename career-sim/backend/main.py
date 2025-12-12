from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from agents import generate_roadmap_ai, get_mentor_response

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
