from fastapi import APIRouter
from database.db import get_db

router = APIRouter()

@router.get("/by-provider/{provider_id}")
def get_contracts_by_provider(provider_id: int, lob: str | None = None):
    query = """
        SELECT *
        FROM provider_contract
        WHERE provider_id = ?
    """
    params = [provider_id]

    if lob:
        query += " AND lob = ?"
        params.append(lob)

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
