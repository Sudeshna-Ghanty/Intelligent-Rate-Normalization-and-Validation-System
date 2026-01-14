from fastapi import APIRouter
from services.db_client import get_contracts

router = APIRouter()

@router.get("/by-provider/{provider_id}")
def contracts(provider_id: int, lob: str | None = None):
    return get_contracts(provider_id, lob)
