# ai-service/tools/db_tools.py

import requests

DB_SERVICE_URL = "http://localhost:8001"


def insert_service_rates(rows: list[dict]):
    response = requests.post(
        f"{DB_SERVICE_URL}/service-rates/bulk-insert",
        json=rows
    )
    response.raise_for_status()
    return response.json()
