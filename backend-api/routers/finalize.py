from fastapi import APIRouter, HTTPException
import sqlite3
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "db-service", "provider_fee_schedule.db")

@router.post("/service-rate")
def save_service_rate(payload: dict):
    print("FINALIZE PAYLOAD RECEIVED:", payload)

    try:
        fee_schedule_id = payload["fee_schedule_id"]
        service_code = payload["service_code"]
        description = payload.get("description")
        ai_rate = payload["ai_rate"]

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check if rate already exists
        cursor.execute("""
            SELECT service_rate_id
            FROM service_rate
            WHERE fee_schedule_id = ?
              AND service_code = ?
        """, (fee_schedule_id, service_code))

        existing = cursor.fetchone()

        if existing:
            # UPDATE
            cursor.execute("""
                UPDATE service_rate
                SET amount = ?, status = 'ACTIVE'
                WHERE service_rate_id = ?
            """, (ai_rate, existing[0]))
        else:
            # INSERT
            cursor.execute("""
                INSERT INTO service_rate (
                    service_rate_id,
                    fee_schedule_id,
                    service_code,
                    amount,
                    status
                )
                VALUES (
                    (SELECT COALESCE(MAX(service_rate_id),0)+1 FROM service_rate),
                    ?, ?, ?, 'ACTIVE'
                )
            """, (fee_schedule_id, service_code, ai_rate))

        conn.commit()
        conn.close()

        return {"status": "SUCCESS"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
