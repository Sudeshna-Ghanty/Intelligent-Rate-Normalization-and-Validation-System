# ai-service/agents/planner_agent.py

def planner_agent(state):
    """
    Decide execution plan based on document type.
    """
    doc_type = state["document_type"]

    if doc_type in ["pdf", "image"]:
        plan = "OCR_REQUIRED"
    else:
        plan = "DIRECT_PARSE"

    state["plan"] = plan
    return state
