"""
Unit tests for Machine Learning Pipeline & SHAP Predictor.
"""

import pytest
from ml.predictor import mule_predictor

def test_mule_predictor():
    sample_mule_features = {
        "in_degree": 6,
        "out_degree": 6,
        "betweenness_centrality": 0.089,
        "closeness_centrality": 0.45,
        "pagerank": 0.042,
        "forwarding_ratio": 0.95,
        "dormancy_period": 200,
        "is_dormant": 1,
        "transfers_in_10m": 12,
        "avg_amount": 85000.0,
        "amount_variance": 5000.0,
        "component_size": 5,
        "has_cycle": 0,
        "hop_distance": 3,
        "neighbor_risk_score": 0.90,
        "fan_out_count": 4,
        "fan_in_count": 4
    }

    pred = mule_predictor.predict_account(sample_mule_features)
    assert "ml_risk_score" in pred
    assert pred["ml_risk_score"] > 0.50
    assert pred["risk_category"] in ["CRITICAL", "HIGH"]
    assert len(pred["shap_explanations"]) > 0
