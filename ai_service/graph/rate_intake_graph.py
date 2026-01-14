# ai-service/graph/rate_intake_graph.py

from langgraph.graph import StateGraph
from typing import TypedDict, List, Dict

from agents.planner_agent import planner_agent
from agents.ocr_agent import ocr_agent
from agents.extraction_agent import extraction_agent
from agents.normalization_agent import normalization_agent
from agents.validation_agent import validation_agent
from agents.confidence_agent import confidence_agent
from agents.persistence_agent import persistence_agent


class RateIntakeState(TypedDict):
    document_id: int
    document_type: str
    file_link: str
    raw_text: str
    extracted_rows: List[Dict]
    normalized_rows: List[Dict]
    validated_rows: List[Dict]
    confidence_scores: List[Dict]
    final_rows: List[Dict]


def build_graph():
    graph = StateGraph(RateIntakeState)

    graph.add_node("planner", planner_agent)
    graph.add_node("ocr", ocr_agent)
    graph.add_node("extract", extraction_agent)
    graph.add_node("normalize", normalization_agent)
    graph.add_node("validate", validation_agent)
    graph.add_node("confidence", confidence_agent)
    graph.add_node("persist", persistence_agent)

    graph.set_entry_point("planner")

    graph.add_edge("planner", "ocr")
    graph.add_edge("ocr", "extract")
    graph.add_edge("extract", "normalize")
    graph.add_edge("normalize", "validate")
    graph.add_edge("validate", "confidence")
    graph.add_edge("confidence", "persist")

    graph.set_finish_point("persist")

    return graph.compile()


graph_executor = build_graph()


def run_rate_intake(payload: dict):
    return graph_executor.invoke(payload)
