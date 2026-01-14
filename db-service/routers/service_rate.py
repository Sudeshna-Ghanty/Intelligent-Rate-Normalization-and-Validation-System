from fastapi import APIRouter
from database.db import get_db
from fastapi import APIRouter
from database.db import get_db

router = APIRouter()

@router.get("/by-fee-schedule/{fee_schedule_id}")
def get_rates(fee_schedule_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM service_rate WHERE fee_schedule_id = ?",
            (fee_schedule_id,)
        ).fetchall()
        return [dict(r) for r in rows]


@router.post("/bulk-insert")
def insert_service_rates(payload: list[dict]):
    with get_db() as conn:
        for row in payload:
            conn.execute(
                """
                INSERT INTO service_rate (
                    service_rate_id,
                    fee_schedule_id,
                    service_code,
                    description,
                    modifier,
                    unit,
                    unit_type,
                    amount,
                    currency,
                    facility_indicator,
                    global_surgery_indicator,
                    multiple_surgery_indicator,
                    rule_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    row["service_rate_id"],
                    row["fee_schedule_id"],
                    row["service_code"],
                    row["description"],
                    row.get("modifier"),
                    row["unit"],
                    row["unit_type"],
                    row["amount"],
                    row["currency"],
                    row["facility_indicator"],
                    row["global_surgery_indicator"],
                    row["multiple_surgery_indicator"],
                    row["rule_id"],
                    row["status"]
                )
            )
        conn.commit()

    return {"status": "Service rates inserted"}

@router.get("/by-contract/{contract_id}")
def get_existing_rates(contract_id: int):
    """
    Fetch existing service rates for a given contract
    """

    query = """
        SELECT
            service_code,
            amount
        FROM service_rate
        WHERE fee_schedule_id IN (
            SELECT fee_schedule_id
            FROM fee_schedule
            WHERE contract_id = ?
        )
        AND status = 'ACTIVE'
    """

    with get_db() as conn:
        rows = conn.execute(query, (contract_id,)).fetchall()

    return {
        row["service_code"]: row["amount"]
        for row in rows
    }
