# ai-service/agents/confidence_agent.py

def confidence_agent(state):
    final_rows = []

    for row in state["validated_rows"]:
        base_confidence = 0.7
        if row["historical_matches"] > 0:
            base_confidence += 0.2
        if row["validation_status"] == "INVALID":
            base_confidence = 0.3

        row["confidence_score"] = round(min(base_confidence, 0.99), 2)
        final_rows.append(row)

    state["final_rows"] = final_rows
    return state
