from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/rate-intake", tags=["Rate Intake"])

class RateReviewRequest(BaseModel):
    provider_id: int
    contract_id: int
    schedule_name: str
    document_link: str
import requests


@router.post("/process")
def process_rate_sheet(payload: RateReviewRequest):

    # 1️⃣ Fetch existing rates from DB service
    db_response = requests.get(
        f"http://localhost:8001/service-rates/by-contract/{payload.contract_id}"
    )

    existing_rates = db_response.json()

    # 2️⃣ Send document + existing rates to AI service
    ai_response = requests.post(
        "http://localhost:8002/ai/parse-rate-sheet",
        json={
            "document_link": payload.document_link,
            "existing_rates": existing_rates
        }
    )

    if ai_response.status_code != 200:
        return {
            "error": "AI service failed",
            "details": ai_response.text
        }

    return ai_response.json()

# @router.post("/process")
# def process_rate_sheet(payload: RateReviewRequest):
#     """
#     PHASE 1:
#     Mock AI response.
#     Later replaced with real OCR / NLP / ML.
#     """

#     # Simulated AI-parsed + comparison output
#     return [
#         {
#             "service_code": "99213",
#             "description": "Office visit – established patient",
#             "existing_rate": 75,
#             "ai_rate": 90,
#             "status": "AMBIGUOUS"
#         },
#         {
#             "service_code": "93000",
#             "description": "Electrocardiogram",
#             "existing_rate": 40,
#             "ai_rate": 40,
#             "status": "CLEAN"
#         },
#         {
#             "service_code": "72148",
#             "description": "MRI Lumbar Spine",
#             "existing_rate": 500,
#             "ai_rate": 0,
#             "status": "INVALID"
#         }
#     ]
