import pandas as pd

def parse_excel_rate_sheet(file_path: str):
    """
    Reads an Excel fee schedule and extracts service code, description, rate
    """

    df = pd.read_excel(file_path)

    # Normalize column names
    df.columns = [c.strip().upper() for c in df.columns]

    required_cols = ["CPT", "DESCRIPTION", "RATE"]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    parsed_rows = []

    for _, row in df.iterrows():
        parsed_rows.append({
            "service_code": str(row["CPT"]).strip(),
            "description": str(row["DESCRIPTION"]).strip(),
            "ai_rate": float(row["RATE"])
        })

    return parsed_rows
