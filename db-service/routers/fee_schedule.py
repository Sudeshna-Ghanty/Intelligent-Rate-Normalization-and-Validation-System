from fastapi import APIRouter
from database.db import get_db

router = APIRouter()

@router.post("/create")
def create_fee_schedule(payload: dict):
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO fee_schedule (
                fee_schedule_id,
                contract_id,
                schedule_name,
                schedule_type,
                effective_date,
                end_date,
                document_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["fee_schedule_id"],
                payload["contract_id"],
                payload["schedule_name"],
                payload["schedule_type"],
                payload["effective_date"],
                payload.get("end_date"),
                payload["document_id"]
            )
        )
        conn.commit()

    return {"status": "Fee schedule created"}
