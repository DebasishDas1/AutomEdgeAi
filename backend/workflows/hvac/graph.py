# workflows/hvac/graph.py
# HVAC chat and post-chat LangGraph graphs.
#
# TWO GRAPHS:
#   hvac_chat_graph       — live chat turns, called per message (<500ms)
#   hvac_post_chat_graph  — background, runs once on completion
#                           (extract_final → score_lead → summary → email → sheets)
from langgraph.graph import StateGraph, END

from workflows.hvac.nodes import (
    node_check_complete,
    node_chat_reply,
    node_extract_fields,
    node_extract_final,
    node_score_lead,
    node_generate_summary,
    node_send_email,
    node_save_sheets,
)


# ── Graph 1: chat_graph ───────────────────────────────────────────────────────

def build_hvac_chat_graph() -> StateGraph:
    g = StateGraph(dict)

    g.add_node("check_complete", node_check_complete)
    g.add_node("chat_reply",     node_chat_reply)
    g.add_node("extract_fields", node_extract_fields)

    g.set_entry_point("check_complete")

    g.add_conditional_edges(
        "check_complete",
        lambda state: "complete" if state.get("is_complete") else "continue",
        {"complete": END, "continue": "chat_reply"},
    )
    g.add_edge("chat_reply",     "extract_fields")
    g.add_edge("extract_fields", END)

    return g.compile()


# ── Graph 2: post_chat_graph ──────────────────────────────────────────────────

def build_hvac_post_chat_graph() -> StateGraph:
    g = StateGraph(dict)

    g.add_node("extract_final",    node_extract_final)
    g.add_node("score_lead",       node_score_lead)
    g.add_node("generate_summary", node_generate_summary)
    g.add_node("send_email",       node_send_email)
    g.add_node("save_sheets",      node_save_sheets)

    g.set_entry_point("extract_final")
    g.add_edge("extract_final",    "score_lead")
    g.add_edge("score_lead",       "generate_summary")

    # Skip email for cold leads with no email address
    g.add_conditional_edges(
        "generate_summary",
        lambda state: "email" if state.get("email") and state.get("score") != "cold" else "no_email",
        {"email": "send_email", "no_email": "save_sheets"},
    )
    g.add_edge("send_email", "save_sheets")
    g.add_edge("save_sheets", END)

    return g.compile()


# ── Compiled instances — imported by services/workflow_service.py ────────────
hvac_chat_graph      = build_hvac_chat_graph()
hvac_post_chat_graph = build_hvac_post_chat_graph()