"""
Neo4j Database Client wrapper for Cypher graph queries.
Handles node & relationship insertion and graph traversals.
"""

import os
from typing import Dict, List, Any, Optional

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

class Neo4jClient:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "mulepass123")
        self.driver = None
        self.is_connected = False
        self._connect()

    def _connect(self):
        if not NEO4J_AVAILABLE:
            print("[!] neo4j Python driver not installed. Running in memory graph mode.")
            return

        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            with self.driver.session() as session:
                session.run("RETURN 1")
            self.is_connected = True
            print(f"[+] Successfully connected to Neo4j database at {self.uri}")
            self._setup_schema()
        except Exception as e:
            print(f"[!] Neo4j connection un-available ({e}). Using NetworkX in-memory graph fallback.")
            self.is_connected = False

    def _setup_schema(self):
        if not self.is_connected:
            return
        queries = [
            "CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.account_id IS UNIQUE",
            "CREATE INDEX account_risk_idx IF NOT EXISTS FOR (a:Account) ON (a.risk_score)",
            "CREATE INDEX tx_timestamp_idx IF NOT EXISTS FOR ()-[r:TRANSFERRED]-() ON (r.timestamp)"
        ]
        with self.driver.session() as session:
            for q in queries:
                try:
                    session.run(q)
                except Exception as e:
                    print(f"[!] Schema creation note: {e}")

    def close(self):
        if self.driver:
            self.driver.close()

    def sync_accounts_and_transactions(self, accounts: List[Dict], transactions: List[Dict]):
        if not self.is_connected:
            return

        print("[*] Syncing accounts and transactions to Neo4j...")
        with self.driver.session() as session:
            # Batch create accounts
            session.run("""
                UNWIND $accounts AS acc
                MERGE (a:Account {account_id: acc.account_id})
                SET a.opened_date = acc.opened_date,
                    a.balance = acc.balance,
                    a.account_type = acc.account_type,
                    a.kyc_status = acc.kyc_status,
                    a.risk_score = acc.risk_score,
                    a.is_dormant = acc.is_dormant
            """, accounts=accounts)

            # Batch create transactions
            session.run("""
                UNWIND $txs AS tx
                MERGE (s:Account {account_id: tx.sender})
                MERGE (r:Account {account_id: tx.receiver})
                CREATE (s)-[rel:TRANSFERRED {
                    transaction_id: tx.transaction_id,
                    amount: tx.amount,
                    timestamp: tx.timestamp,
                    channel: tx.channel,
                    location: tx.location
                }]->(r)
            """, txs=transactions[:5000]) # Sync first batch

        print("[+] Sync to Neo4j complete.")

# Global singleton
neo4j_client = Neo4jClient()
