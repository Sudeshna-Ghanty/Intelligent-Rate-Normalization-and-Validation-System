# backend-api/routers/fee_schedule.py

from fastapi import APIRouter
from services.db_client import create_fee_schedule

router = APIRouter()

@router.post("/create")
def create(payload: dict):
    """
    Creates fee_schedule in DB service (DRAFT state)
    """
    return create_fee_schedule(payload)
