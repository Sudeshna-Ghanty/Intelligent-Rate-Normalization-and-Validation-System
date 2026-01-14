# ai-service/agents/ocr_agent.py

def ocr_agent(state):
    """
    Placeholder OCR logic.
    Replace with Tesseract / Vision API.
    """
    file_link = state["file_link"]

    extracted_text = f"OCR_EXTRACTED_TEXT_FROM_{file_link}"

    state["raw_text"] = extracted_text
    return state
