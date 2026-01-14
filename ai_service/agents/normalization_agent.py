# ai-service/agents/normalization_agent.py

def normalization_agent(state):
    normalized = []

    for row in state["extracted_rows"]:
        row["currency"] = "USD"
        row["unit"] = 1
        row["unit_type"] = "Procedure"
        row["rule_id"] = "AUTO_NORMALIZED"
        row["status"] = "Draft"
        normalized.append(row)

    state["normalized_rows"] = normalized
    return state
