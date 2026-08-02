"""
Unit tests for GraphEngine NetworkX algorithms.
"""

import pytest
from database.graph_engine import graph_engine

def test_graph_engine_summary():
    summary = graph_engine.get_summary()
    assert summary["total_accounts"] >= 100
    assert summary["total_transactions"] >= 500
    assert summary["graph_nodes"] > 0
    assert summary["graph_edges"] > 0

def test_bfs_traversal():
    nodes = graph_engine.bfs_traversal("ACC-10000", max_depth=2)
    assert len(nodes) > 0
    assert nodes[0]["node"] == "ACC-10000"

def test_find_shortest_path():
    res = graph_engine.find_shortest_path("ACC-10000", "ACC-10003")
    assert res["found"] is True
    assert len(res["path"]) == 4 # ACC-10000 -> ACC-10001 -> ACC-10002 -> ACC-10003

def test_ring_detail():
    ring = graph_engine.get_ring_detail("RING-001")
    assert ring is not None
    assert ring["ring_id"] == "RING-001"
    assert ring["risk_score"] == 0.94
    assert len(ring["graph"]["nodes"]) > 0
