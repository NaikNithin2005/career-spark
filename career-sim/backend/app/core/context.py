# For now we store in-memory (later DB)
USER_CONTEXT = {
    "education": "Not set",
    "marks": None,
    "interests": [],
    "skills": [],
    "career_goal": None,
    "language": "en"
}

def get_context():
    return USER_CONTEXT

def update_context(data: dict):
    USER_CONTEXT.update(data)
