from fastapi import FastAPI
from app.routes.mentor import router as mentor_router

app = FastAPI()
app.include_router(mentor_router)

# Basic root endpoint for health check
@app.get("/")
def read_root():
    return {"message": "Career Path Simulator Backend"}
