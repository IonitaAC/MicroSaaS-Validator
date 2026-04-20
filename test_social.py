import requests
import json

url = "http://127.0.0.1:8080/api/validate/step4-social"
payload = {"idea": "Uber for dog walkers"}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, timeout=60)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Error:")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
