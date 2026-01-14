# backend-api/routers/service_rate.py

from fastapi import APIRouter, HTTPException
from services.db_client import insert_service_rates

router = APIRouter()

@router.post("/insert")
def insert_rates(payload: list[dict]):
    """
    Inserts APPROVED service rates into DB Service.
    Called only after user review & finalize.
    """
    try:
        return insert_service_rates(payload)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to insert service rates: {str(e)}"
        )
