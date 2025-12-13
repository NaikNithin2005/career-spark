
import requests

url = "http://localhost:8000/api/generate-assessment-from-file"
files = {'file': open('test_context.txt', 'rb')}
data = {'count': 3}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
