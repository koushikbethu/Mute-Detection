"""
Integration tests for FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_risk_summary_endpoint():
    response = client.get("/api/v1/risk-summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_accounts" in data
    assert "detected_rings_count" in data

def test_ring_detail_endpoint():
    response = client.get("/api/v1/ring/RING-001")
    assert response.status_code == 200
    data = response.json()
    assert data["ring_id"] == "RING-001"
    assert data["risk_score"] == 0.94
    assert len(data["flow_sequence"]) > 0

def test_predict_endpoint():
    response = client.post("/api/v1/predict", json={"account_id": "ACC-10000"})
    assert response.status_code == 200
    data = response.json()
    assert data["account_id"] == "ACC-10000"
    assert "final_risk_score" in data
