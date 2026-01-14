# ai-service/agents/extraction_agent.py

from vector_store.faiss_store import VectorStoreManager

def extraction_agent(state):
    vector_manager = VectorStoreManager()

    raw_text = state["raw_text"]

    # Store raw text chunks for future reference
    vector_manager.add_documents(
        texts=[raw_text],
        metadatas=[{
            "document_id": state["document_id"],
            "type": "raw_text"
        }]
    )

    # Simulated extraction
    extracted_rows = [
        {
            "service_code": "81000",
            "description": "Urinalysis",
            "facility_indicator": "Non-Facility",
            "amount": 4.00
        },
        {
            "service_code": "81001",
            "description": "Urinalysis, microscopy",
            "facility_indicator": "Non-Facility",
            "amount": 3.17
        }
    ]

    state["extracted_rows"] = extracted_rows
    return state
