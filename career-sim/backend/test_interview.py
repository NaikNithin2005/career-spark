
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_interview_flow():
    print("--- Testing Start Interview ---")
    start_payload = {"role": "Junior Python Developer", "focus": "Technical"}
    res = requests.post(f"{BASE_URL}/start-interview", json=start_payload)
    
    if res.status_code != 200:
        print(f"FAILED Start: {res.text}")
        return
        
    start_data = res.json()
    print(f"Start Response: {json.dumps(start_data, indent=2)}")
    
    first_question = start_data.get("question", "What is Python?")
    
    print("\n--- Testing Interaction (Answer 1) ---")
    interact_payload = {
        "role": "Junior Python Developer",
        "history": [],
        "last_question": first_question,
        "user_answer": "Python is a high-level interpreted language known for readability."
    }
    res = requests.post(f"{BASE_URL}/interview-interaction", json=interact_payload)
    if res.status_code != 200:
        print(f"FAILED Interaction: {res.text}")
        return
        
    interact_data = res.json()
    print(f"Interaction Response: {json.dumps(interact_data, indent=2)}")

    if "style_feedback" in interact_data:
        print("SUCCESS: Style Feedback Received")
    else:
        print("WARNING: Style Feedback Missing")
    
    next_q = interact_data.get("next_question", "Next Q")
    
    print("\n--- Testing Feedback ---")
    # Simulate a short history
    history = [
        {"question": first_question, "answer": "Python is a high-level interpreted language known for readability."},
        {"question": next_q, "answer": "I am not sure about that details."}
    ]
    
    feedback_payload = {
        "role": "Junior Python Developer",
        "history": history
    }
    
    res = requests.post(f"{BASE_URL}/interview-feedback", json=feedback_payload)
    if res.status_code != 200:
        print(f"FAILED Feedback: {res.text}")
        return
        
    feedback_data = res.json()
    print(f"Feedback Response: {json.dumps(feedback_data, indent=2)}")

if __name__ == "__main__":
    test_interview_flow()
