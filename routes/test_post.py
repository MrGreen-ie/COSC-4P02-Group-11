import requests

url = "http://127.0.0.1:5000/api/ai/summarize"
payload = {"text": "Artificial Intelligence is transforming industries."}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response:", response.json())
