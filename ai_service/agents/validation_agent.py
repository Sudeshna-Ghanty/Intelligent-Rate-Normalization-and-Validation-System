# ai-service/agents/validation_agent.py

from vector_store.faiss_store import VectorStoreManager

def validation_agent(state):
    vector_manager = VectorStoreManager()
    validated = []

    for row in state["normalized_rows"]:
        similar = vector_manager.similarity_search(
            query=row["description"],
            k=2
        )

        # Example rule: if similar historical entries exist, confidence increases
        row["historical_matches"] = len(similar)
        row["validation_status"] = "VALID" if row["amount"] > 0 else "INVALID"
        validated.append(row)

    state["validated_rows"] = validated
    return state
