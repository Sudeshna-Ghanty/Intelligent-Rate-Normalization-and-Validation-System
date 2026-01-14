from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import sqlite3
import openpyxl
import xlrd


from normalization.rate_normalizer import normalize_rate
from normalization.confidence import calculate_confidence, determine_status
from normalization.text_similarity import similarity

# ---------------- APP SETUP ---------------- #

app = FastAPI(title="AI Rate Intake Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONFIG ---------------- #

DATA_FOLDER = "ai_service/data"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "db-service", "provider_fee_schedule.db")

os.makedirs(DATA_FOLDER, exist_ok=True)

# ---------------- DB LOOKUPS ---------------- #

def get_existing_rate(contract_id: int, service_code: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sr.amount
        FROM service_rate sr
        JOIN fee_schedule fs
          ON sr.fee_schedule_id = fs.fee_schedule_id
        WHERE fs.contract_id = ?
          AND sr.service_code = ?
        LIMIT 1
    """, (contract_id, service_code))

    row = cursor.fetchone()
    conn.close()
    return float(row[0]) if row else None


def get_db_description(contract_id: int, service_code: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sr.description
        FROM service_rate sr
        JOIN fee_schedule fs
          ON sr.fee_schedule_id = fs.fee_schedule_id
        WHERE fs.contract_id = ?
          AND sr.service_code = ?
        LIMIT 1
    """, (contract_id, service_code))

    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

# ---------------- FILE SAVE ---------------- #

def save_file(content: bytes, filename: str) -> str:
    path = os.path.join(DATA_FOLDER, filename)
    with open(path, "wb") as f:
        f.write(content)
    return path

# ---------------- API ---------------- #

@app.post("/ai/parse-rate-sheet")
async def parse_rate_sheet(
    contract_id: int = Form(...),
    document_link: str = Form(None),
    file: UploadFile = File(None)
):
    if not document_link and not file:
        raise HTTPException(status_code=400, detail="No file or link provided")

    # --- fetch file ---
    if document_link:
        try:
            r = requests.get(document_link)
            r.raise_for_status()
            file_path = save_file(r.content, "downloaded_rate_sheet.xlsx")
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        content = await file.read()
        file_path = save_file(content, file.filename)

    parsed_rows = parse_excel(file_path)
    comparison = compare_with_existing(parsed_rows, contract_id)

    return {"comparison": comparison}

# ---------------- EXCEL PARSING ---------------- #

def parse_excel(file_path: str):
    ext = file_path.split(".")[-1].lower()
    rows = []

    if ext == "xlsx":
        wb = openpyxl.load_workbook(file_path)
        sheet = wb.active
        headers = [c.value for c in sheet[1]]

        for row in sheet.iter_rows(min_row=2):
            row_dict = {}

            for idx, cell in enumerate(row):
                header = headers[idx]

                # Preserve raw text EXACTLY as user entered
                if header == "RATE":
                    row_dict[header] = cell.value if cell.value is not None else ""
                else:
                    row_dict[header] = cell.value

            rows.append(row_dict)


    elif ext == "xls":
        wb = xlrd.open_workbook(file_path)
        sheet = wb.sheet_by_index(0)
        headers = sheet.row_values(0)

        for i in range(1, sheet.nrows):
            row_dict = {}
            for idx, header in enumerate(headers):
                value = sheet.cell_value(i, idx)
                row_dict[header] = str(value) if header == "RATE" else value

            rows.append(row_dict)


    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    parsed = []
    for r in rows:
        parsed.append({
            "service_code": str(int(r["CPT"])) if r.get("CPT") is not None else None,
            "description": str(r.get("DESCRIPTION", "")),
            "raw_rate_text": str(r.get("RATE", ""))  # document value
        })

    return parsed


def humanize_issues(issues: list) -> str:
    """
    Converts technical issue codes into clear, human-readable notes
    suitable for business users.
    """
    if not issues:
        return "No issues detected."

    messages = []

    for issue in issues:
        # ---------------- STRING ISSUES ---------------- #
        if isinstance(issue, str):
            if issue == "CPT_CODE_NOT_PRESENT_IN_THE_SYSTEM":
                messages.append(
                    "CPT code does not exist in the system."
                )

            elif issue == "AMBIGUOUS_RATE_TEXT":
                messages.append(
                    "Rate information in the document is ambiguous and requires manual review."
                )

            elif issue == "EMPTY_RATE":
                messages.append(
                    "Rate value is missing in the uploaded document."
                )

            else:
                messages.append(issue.replace("_", " ").capitalize() + ".")

        # ---------------- OBJECT ISSUES ---------------- #
        elif isinstance(issue, dict):
            if issue.get("type") == "DESCRIPTION_MISMATCH":
                db_val = issue.get("db_value", "N/A")
                file_val = issue.get("file_value", "N/A")

                messages.append(
                    f"Service description mismatch: "
                    f"in the uploaded file it is '{file_val}', "
                    f"while in the system it is '{db_val}'."
                )

    return " ".join(messages)

# ---------------- COMPARISON ---------------- #

def compare_with_existing(parsed_rows, contract_id):
    results = []

    for row in parsed_rows:
        service_code = row["service_code"]
        file_description = row["description"]
        raw_rate_text = row["raw_rate_text"]

        # --- normalize rate ---
        normalized_rate, modifiers, issues = normalize_rate(raw_rate_text)

        # --- DB lookups ---
        existing_rate = get_existing_rate(contract_id, service_code)
        db_description = get_db_description(contract_id, service_code)
        
        cpt_exists = existing_rate is not None

        if not cpt_exists:
            issues.append("CPT_CODE_NOT_PRESENT_IN_THE_SYSTEM")
        # --- description similarity ---
        if db_description:
            desc_similarity = similarity(db_description, file_description)
            if desc_similarity < 0.85:
                issues.append({
                    "type": "DESCRIPTION_MISMATCH",
                    "db_value": db_description,
                    "file_value": file_description
                })
        else:
            pass

        # --- confidence ---
        confidence = calculate_confidence(
            cpt_valid=service_code.isdigit() and len(service_code) == 5,
            description_similarity=desc_similarity,
            issues=issues,
            modifiers=modifiers
        )

        # --- FINAL STATUS (FIXED) ---
        status = determine_status(
            cpt_exists=existing_rate is not None,
            issues=issues
        )

        results.append({
            "service_code": service_code,
            "description": file_description,
            "ai_description": db_description,

            # UI contract (LOCKED)
            "existing_rate": raw_rate_text,   # document text
            "ai_rate": normalized_rate,       # normalized number

            "modifiers": modifiers,
            "issues": issues,
            "notes": humanize_issues(issues),
            "confidence": confidence,
            "status": status
        })

    return results
