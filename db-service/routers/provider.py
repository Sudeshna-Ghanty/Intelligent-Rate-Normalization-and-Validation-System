from fastapi import APIRouter, Query
from database.db import get_db
from fastapi import APIRouter
import sqlite3
import os

router = APIRouter()

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_PATH = os.path.join(BASE_DIR, "..", "db-service", "provider_fee_schedule.db")
DB_PATH="provider_fee_schedule.db"
import sqlite3

def query_db(query, params=(), commit=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    try:
        cur.execute(query, params)

        # If the query is a modifying query (UPDATE, INSERT, DELETE), commit the changes
        if commit:
            conn.commit()
            return cur.lastrowid

        # Read-only query
        data = cur.fetchall()
        return data

    except Exception as e:
        print(f"[query_db] Error running query: {query!r} with params: {params!r}")
        print(f"[query_db] Exception: {e!r}")
        raise
    finally:
        try:
            cur.close()
        except NameError:
            pass
        conn.close()


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn




@router.get("/all")
def get_all_providers():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            provider_id,
            provider_name,
            npi,
            tax_id,
            provider_type,
            specialty
        FROM provider
        ORDER BY provider_name
    """)

    rows = cursor.fetchall()
    conn.close()

    providers = []
    for r in rows:
        providers.append({
            "provider_id": r[0],
            "provider_name": r[1],
            "npi": r[2],
            "tax_id": r[3],
            "provider_type": r[4],
            "specialty": r[5],
           
        })

    return providers







@router.get("/search")
def search_providers(
    tax_id: str | None = None,
    npi: str | None = None,
    provider_name: str | None = None,
    provider_type: str | None = None,
    specialty: str | None = None,
    location: str | None = None
):
    query = "SELECT * FROM provider WHERE 1=1"
    params = []

    if tax_id:
        query += " AND tax_id = ?"
        params.append(tax_id)
    if npi:
        query += " AND npi = ?"
        params.append(npi)
    if provider_name:
        query += " AND provider_name LIKE ?"
        params.append(f"%{provider_name}%")
    if provider_type:
        query += " AND provider_type = ?"
        params.append(provider_type)
    if specialty:
        query += " AND specialty = ?"
        params.append(specialty)
    if location:
        query += " AND location = ?"
        params.append(location)
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
