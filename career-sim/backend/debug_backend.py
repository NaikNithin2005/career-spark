
import requests
import json

def test_assessment():
    url = "http://localhost:8000/api/generate-assessment"
    data = {
        "topic": "Python",
        "difficulty": "Beginner",
        "count": 1
    }
    try:
        print(f"Sending request to {url}...")
        res = requests.post(url, json=data)
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.text[:500]}")
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test_assessment()
