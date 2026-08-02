"""
Unit tests for Synthetic Data Generator.
"""

import os
import pytest
import pandas as pd
from generator.synthetic_generator import generate_synthetic_data, DATASET_DIR

def test_generate_synthetic_data():
    accounts_df, transactions_df, rings = generate_synthetic_data(num_accounts=100, num_transactions=500)
    
    assert len(accounts_df) == 100
    assert len(transactions_df) >= 500
    assert len(rings) >= 3

    assert "account_id" in accounts_df.columns
    assert "is_dormant" in accounts_df.columns
    assert "sender" in transactions_df.columns
    assert "receiver" in transactions_df.columns
    assert "amount" in transactions_df.columns

    # Verify Ring 1 presence
    ring1 = next((r for r in rings if r["ring_id"] == "RING-001"), None)
    assert ring1 is not None
    assert ring1["entry_node"] == "ACC-10000"
    assert ring1["exit_node"] == "ACC-10003"
