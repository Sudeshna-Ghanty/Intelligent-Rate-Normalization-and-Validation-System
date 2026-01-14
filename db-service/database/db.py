# db-service/database/db.py
import sqlite3
from contextlib import contextmanager

DB_PATH = "C:/Users/Sudeshna/Downloads/provider-rate-intake/db-service/provider_fee_schedule.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
