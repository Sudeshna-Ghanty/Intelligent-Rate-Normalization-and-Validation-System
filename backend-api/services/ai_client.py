import requests

AI_SERVICE_URL = "http://localhost:8002"

def process_rate_sheet(payload):
    return requests.post(
        f"{AI_SERVICE_URL}/process",
        json=payload
    ).json()
