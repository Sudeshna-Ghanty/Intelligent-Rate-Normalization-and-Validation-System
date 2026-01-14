# ai-service/agents/persistence_agent.py

from tools.db_tools import insert_service_rates


def persistence_agent(state):
    final_rows = state["final_rows"]

    insert_service_rates(final_rows)

    return {
        "status": "SUCCESS",
        "inserted_records": len(final_rows)
    }
