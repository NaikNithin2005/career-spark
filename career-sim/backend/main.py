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
class CareerInput(BaseModel):
    education: str
    stream: str
    interests: str
    target_role: str
    experience_level: str
    # Add other fields as needed

class ChatMessage(BaseModel):
    role: str
    parts: List[str]

class ChatRequest(BaseModel):
    history: List[Dict[str, Any]] # format expected by Gemini: [{"role": "user", "parts": ["..."]}]
    message: str

@app.get("/")
async def root():
    return {"status": "ok", "message": "Career Path Simulator Backend is running"}

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
