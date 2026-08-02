"""
Unit tests for Fraud Rule Engine.
"""

import pytest
from rules.rule_engine import rule_engine

def test_dormancy_rule_trigger():
    mule_data = {
        "is_dormant": True,
        "transfers_in_10m": 12,
        "forwarding_ratio": 0.95,
        "in_degree": 6,
        "out_degree": 6
    }
    result = rule_engine.evaluate_account(mule_data)
    assert result["triggered_count"] >= 3
    assert result["rule_risk_score"] > 0.50

    triggered_ids = [r["rule_id"] for r in result["triggered_rules"]]
    assert "RULE_001" in triggered_ids # Dormancy
    assert "RULE_002" in triggered_ids # Velocity
    assert "RULE_003" in triggered_ids # Forwarding Ratio

def test_normal_account_rule_pass():
    normal_data = {
        "is_dormant": False,
        "transfers_in_10m": 1,
        "forwarding_ratio": 0.10,
        "in_degree": 2,
        "out_degree": 1
    }
    result = rule_engine.evaluate_account(normal_data)
    assert result["triggered_count"] == 0
    assert result["rule_risk_score"] == 0.0
