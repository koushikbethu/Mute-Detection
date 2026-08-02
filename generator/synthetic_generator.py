"""
Synthetic Data Generator for Mule Ring Detection System.
Generates 10,000 realistic accounts and 100,000 financial transactions,
including injected multi-hop fraud rings (dormant -> sudden credit -> rapid forward -> withdrawal).
"""

import os
import json
import random
import uuid
from datetime import datetime, timedelta, timezone
import pandas as pd
import numpy as np

# Ensure deterministic randomness for reproducibility while allowing variability
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", 
    "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore"
]

ACCOUNT_TYPES = ["SAVINGS", "CURRENT", "SALARY", "DIGITAL"]
KYC_STATUSES = ["VERIFIED", "VERIFIED", "VERIFIED", "PENDING", "PARTIAL"]
CHANNELS = ["UPI", "NET_BANKING", "IMPS", "NEFT", "ATM"]

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")

def generate_synthetic_data(num_accounts=10000, num_transactions=100000):
    os.makedirs(DATASET_DIR, exist_ok=True)
    base_time = datetime.now(timezone.utc) - timedelta(days=180)

    print(f"[*] Generating {num_accounts} accounts...")
    accounts = []
    account_ids = [f"ACC-{10000 + i}" for i in range(num_accounts)]
    
    # Reserve first 50 accounts for special injected mule rings
    mule_account_ids = account_ids[:50]
    normal_account_ids = account_ids[50:]

    for idx, acc_id in enumerate(account_ids):
        # Default distribution: 15% dormant accounts
        is_mule = idx < 50
        is_dormant = random.random() < 0.15 if not is_mule else False

        opened_days_ago = random.randint(200, 1500) if not is_mule else random.randint(300, 1000)
        opened_date = (base_time - timedelta(days=opened_days_ago)).isoformat()
        
        balance = round(random.uniform(500, 50000), 2)
        if is_dormant:
            balance = round(random.uniform(10, 500), 2)

        account = {
            "account_id": acc_id,
            "opened_date": opened_date,
            "balance": balance,
            "account_type": random.choice(ACCOUNT_TYPES),
            "kyc_status": random.choice(KYC_STATUSES) if not is_mule else "VERIFIED",
            "risk_score": 0.05,
            "is_dormant": is_dormant,
            "is_mule_label": is_mule
        }
        accounts.append(account)

    accounts_df = pd.DataFrame(accounts)

    print(f"[*] Injecting Fraudulent Mule Rings into accounts...")
    transactions = []
    rings = []
    
    # Ring 1: Primary Target Demo Ring (RING-001)
    # Dormant ACC-10000 receives $85,000 -> forwards 95% to ACC-10001 -> ACC-10002 -> ACC-10003 -> ATM Withdrawal
    ring1_nodes = ["ACC-10000", "ACC-10001", "ACC-10002", "ACC-10003", "ACC-10004"]
    # Mark ACC-10000 as dormant initially in dataset
    accounts_df.loc[accounts_df["account_id"] == "ACC-10000", "is_dormant"] = True
    accounts_df.loc[accounts_df["account_id"] == "ACC-10000", "balance"] = 120.0
    
    start_time_ring1 = base_time + timedelta(days=175, hours=14, minutes=10)
    
    # 1. External credit into dormant ACC-10000
    t1 = start_time_ring1
    tx_id_counter = 900000
    
    credit_tx = {
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-99999", # External Shell Account
        "receiver": "ACC-10000",
        "amount": 85000.0,
        "timestamp": t1.isoformat(),
        "channel": "IMPS",
        "status": "COMPLETED",
        "location": "Mumbai",
        "device_id": "DEV-MULE-01",
        "ip_address": "192.168.1.101"
    }
    transactions.append(credit_tx)
    tx_id_counter += 1

    # 2. Hop 1: ACC-10000 forwards 95% ($80,750) within 3 mins to ACC-10001
    t2 = t1 + timedelta(minutes=3)
    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10000",
        "receiver": "ACC-10001",
        "amount": 80750.0,
        "timestamp": t2.isoformat(),
        "channel": "UPI",
        "status": "COMPLETED",
        "location": "Mumbai",
        "device_id": "DEV-MULE-01",
        "ip_address": "192.168.1.101"
    })
    tx_id_counter += 1

    # 3. Hop 2: ACC-10001 forwards 95% ($76,712) within 4 mins to ACC-10002
    t3 = t2 + timedelta(minutes=4)
    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10001",
        "receiver": "ACC-10002",
        "amount": 76712.0,
        "timestamp": t3.isoformat(),
        "channel": "UPI",
        "status": "COMPLETED",
        "location": "Delhi",
        "device_id": "DEV-MULE-02",
        "ip_address": "192.168.1.102"
    })
    tx_id_counter += 1

    # 4. Hop 3: ACC-10002 forwards 95% ($72,876) within 3 mins to ACC-10003
    t4 = t3 + timedelta(minutes=3)
    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10002",
        "receiver": "ACC-10003",
        "amount": 72876.0,
        "timestamp": t4.isoformat(),
        "channel": "IMPS",
        "status": "COMPLETED",
        "location": "Bengaluru",
        "device_id": "DEV-MULE-03",
        "ip_address": "192.168.1.103"
    })
    tx_id_counter += 1

    # 5. Final Hop: ACC-10003 ATM Cash Withdrawal ($70,000) within 5 mins
    t5 = t4 + timedelta(minutes=5)
    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10003",
        "receiver": "EXTERNAL_ATM_WITHDRAWAL",
        "amount": 70000.0,
        "timestamp": t5.isoformat(),
        "channel": "ATM",
        "status": "COMPLETED",
        "location": "Bengaluru",
        "device_id": "ATM-BEN-099",
        "ip_address": "10.0.0.99"
    })
    tx_id_counter += 1

    rings.append({
        "ring_id": "RING-001",
        "name": "High Velocity Mule Chain Alpha",
        "risk_score": 0.94,
        "nodes": ring1_nodes,
        "entry_node": "ACC-10000",
        "exit_node": "ACC-10003",
        "total_amount": 85000.0,
        "hop_count": 4,
        "flow_sequence": ["ACC-10000 (Dormant)", "ACC-10001", "ACC-10002", "ACC-10003", "EXTERNAL_ATM_WITHDRAWAL"],
        "reasons": [
            "Dormant account reactivation (>180 days inactive)",
            "Sudden high credit amount (₹85,000)",
            "Rapid forwarding ratio of 95% within 3 minutes",
            "Multi-hop pass-through chain (4 hops in 15 minutes)",
            "Final cash withdrawal via ATM"
        ]
    })

    # Ring 2: Fan-out Mule Ring (RING-002)
    # ACC-10010 receives $120,000 -> splits 4 ways to ACC-10011..10014 -> Fan-in to ACC-10015 -> Cash out
    ring2_nodes = ["ACC-10010", "ACC-10011", "ACC-10012", "ACC-10013", "ACC-10014", "ACC-10015"]
    accounts_df.loc[accounts_df["account_id"] == "ACC-10010", "is_dormant"] = True
    t_ring2 = base_time + timedelta(days=170, hours=10)

    # Entry credit
    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-99998",
        "receiver": "ACC-10010",
        "amount": 120000.0,
        "timestamp": t_ring2.isoformat(),
        "channel": "NEFT",
        "status": "COMPLETED",
        "location": "Hyderabad",
        "device_id": "DEV-MULE-10",
        "ip_address": "192.168.2.10"
    })
    tx_id_counter += 1

    # Split to 4 accounts
    for i, target_acc in enumerate(["ACC-10011", "ACC-10012", "ACC-10013", "ACC-10014"]):
        t_split = t_ring2 + timedelta(minutes=2 + i)
        transactions.append({
            "transaction_id": f"TXN-{tx_id_counter}",
            "sender": "ACC-10010",
            "receiver": target_acc,
            "amount": 28500.0,
            "timestamp": t_split.isoformat(),
            "channel": "UPI",
            "status": "COMPLETED",
            "location": "Hyderabad",
            "device_id": f"DEV-MULE-1{i}",
            "ip_address": f"192.168.2.1{i}"
        })
        tx_id_counter += 1

        # Fan in to ACC-10015
        t_fanin = t_split + timedelta(minutes=4)
        transactions.append({
            "transaction_id": f"TXN-{tx_id_counter}",
            "sender": target_acc,
            "receiver": "ACC-10015",
            "amount": 27000.0,
            "timestamp": t_fanin.isoformat(),
            "channel": "IMPS",
            "status": "COMPLETED",
            "location": "Ahmedabad",
            "device_id": f"DEV-MULE-15",
            "ip_address": "192.168.2.15"
        })
        tx_id_counter += 1

    rings.append({
        "ring_id": "RING-002",
        "name": "Fan-Out Fan-In Laundering Network",
        "risk_score": 0.89,
        "nodes": ring2_nodes,
        "entry_node": "ACC-10010",
        "exit_node": "ACC-10015",
        "total_amount": 120000.0,
        "hop_count": 3,
        "flow_sequence": ["ACC-10010 (Dormant)", "Splits x4 (ACC-10011..10014)", "ACC-10015", "Withdrawal"],
        "reasons": [
            "Dormant account reactivation",
            "Repeated fan-out (4 concurrent transfers)",
            "Repeated fan-in (4 transfers merged into ACC-10015)",
            "Velocity > 8 transactions in 10 minutes"
        ]
    })

    # Ring 3: Circular Loop Mule Ring (RING-003)
    # ACC-10020 -> ACC-10021 -> ACC-10022 -> ACC-10020 (Cycle) -> Cash out
    ring3_nodes = ["ACC-10020", "ACC-10021", "ACC-10022"]
    t_ring3 = base_time + timedelta(days=172, hours=16)

    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10020",
        "receiver": "ACC-10021",
        "amount": 45000.0,
        "timestamp": t_ring3.isoformat(),
        "channel": "UPI",
        "status": "COMPLETED",
        "location": "Chennai",
        "device_id": "DEV-MULE-20",
        "ip_address": "192.168.3.20"
    })
    tx_id_counter += 1

    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10021",
        "receiver": "ACC-10022",
        "amount": 43000.0,
        "timestamp": (t_ring3 + timedelta(minutes=3)).isoformat(),
        "channel": "UPI",
        "status": "COMPLETED",
        "location": "Chennai",
        "device_id": "DEV-MULE-21",
        "ip_address": "192.168.3.21"
    })
    tx_id_counter += 1

    transactions.append({
        "transaction_id": f"TXN-{tx_id_counter}",
        "sender": "ACC-10022",
        "receiver": "ACC-10020",
        "amount": 41000.0,
        "timestamp": (t_ring3 + timedelta(minutes=6)).isoformat(),
        "channel": "UPI",
        "status": "COMPLETED",
        "location": "Chennai",
        "device_id": "DEV-MULE-22",
        "ip_address": "192.168.3.22"
    })
    tx_id_counter += 1

    rings.append({
        "ring_id": "RING-003",
        "name": "Circular Layering Loop",
        "risk_score": 0.85,
        "nodes": ring3_nodes,
        "entry_node": "ACC-10020",
        "exit_node": "ACC-10020",
        "total_amount": 45000.0,
        "hop_count": 3,
        "flow_sequence": ["ACC-10020", "ACC-10021", "ACC-10022", "ACC-10020 (Loop Detected)"],
        "reasons": [
            "Circular transaction path detected (Cycle A->B->C->A)",
            "Layering pattern without legitimate commerce purpose",
            "High transfer velocity within same subnetwork"
        ]
    })

    print(f"[*] Generating {num_transactions - len(transactions)} normal baseline transactions...")
    start_timestamp = base_time
    time_span_seconds = 180 * 86400

    # Fast generation of normal transactions
    normal_senders = np.random.choice(normal_account_ids, size=num_transactions - len(transactions))
    normal_receivers = np.random.choice(normal_account_ids, size=num_transactions - len(transactions))
    
    # Ensure sender != receiver
    same_mask = normal_senders == normal_receivers
    normal_receivers[same_mask] = np.random.choice(normal_account_ids, size=np.sum(same_mask))

    amounts = np.round(np.random.exponential(scale=1500, size=num_transactions - len(transactions)) + 50, 2)
    amounts = np.clip(amounts, 10, 50000)

    time_offsets = np.random.randint(0, time_span_seconds, size=num_transactions - len(transactions))
    time_offsets.sort()

    for idx in range(len(normal_senders)):
        sender = normal_senders[idx]
        receiver = normal_receivers[idx]
        amt = float(amounts[idx])
        t_stamp = (start_timestamp + timedelta(seconds=int(time_offsets[idx]))).isoformat()
        channel = random.choice(CHANNELS)
        loc = random.choice(CITIES)

        transactions.append({
            "transaction_id": f"TXN-{tx_id_counter}",
            "sender": sender,
            "receiver": receiver,
            "amount": amt,
            "timestamp": t_stamp,
            "channel": channel,
            "status": "COMPLETED",
            "location": loc,
            "device_id": f"DEV-{random.randint(1000, 9999)}",
            "ip_address": f"10.1.{random.randint(1,254)}.{random.randint(1,254)}"
        })
        tx_id_counter += 1

    transactions_df = pd.DataFrame(transactions)

    # Save to CSV files
    accounts_csv = os.path.join(DATASET_DIR, "accounts.csv")
    transactions_csv = os.path.join(DATASET_DIR, "transactions.csv")
    rings_json = os.path.join(DATASET_DIR, "rings.json")

    accounts_df.to_csv(accounts_csv, index=False)
    transactions_df.to_csv(transactions_csv, index=False)

    with open(rings_json, "w") as f:
        json.dump(rings, f, indent=2)

    print(f"[+] Successfully generated datasets:")
    print(f"    - Accounts: {len(accounts_df)} -> {accounts_csv}")
    print(f"    - Transactions: {len(transactions_df)} -> {transactions_csv}")
    print(f"    - Fraud Mule Rings: {len(rings)} -> {rings_json}")

    return accounts_df, transactions_df, rings

if __name__ == "__main__":
    generate_synthetic_data()
