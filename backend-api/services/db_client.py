import requests

DB_SERVICE_URL = "http://localhost:8001"

def get_providers(params):
    return requests.get(f"{DB_SERVICE_URL}/providers/search", params=params).json()

def get_contracts(provider_id, lob=None):
    params = {"lob": lob} if lob else {}
    return requests.get(
        f"{DB_SERVICE_URL}/contracts/by-provider/{provider_id}",
        params=params
    ).json()

def create_fee_schedule(payload):
    return requests.post(
        f"{DB_SERVICE_URL}/fee-schedules/create",
        json=payload
    ).json()

def insert_service_rates(rows):
    return requests.post(
        f"{DB_SERVICE_URL}/service-rates/bulk-insert",
        json=rows
    ).json()
