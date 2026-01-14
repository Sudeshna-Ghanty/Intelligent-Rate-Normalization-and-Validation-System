# backend-api/routers/ai_trigger.py
from fastapi import APIRouter, HTTPException
from ai_service.graph.rate_intake_graph import run_rate_intake

router = APIRouter()

@router.post("/process")
def process_rate_sheet(payload: dict):
    try:
        result = run_rate_intake(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
