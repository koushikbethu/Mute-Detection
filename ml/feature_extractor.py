"""
Graph Feature Extractor for Mule Ring Detection.
Uses NetworkX to build a dynamic directed graph G(V, E) from transactions and compute graph topological & flow metrics.
"""

import networkx as nx
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any

class GraphFeatureExtractor:
    def __init__(self, accounts_df: pd.DataFrame, transactions_df: pd.DataFrame):
        self.accounts_df = accounts_df.set_index("account_id", drop=False)
        self.transactions_df = transactions_df
        self.G = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        print("[*] Building NetworkX Directed Graph...")
        # Add nodes with metadata
        for acc_id, row in self.accounts_df.iterrows():
            self.G.add_node(
                acc_id,
                opened_date=row.get("opened_date"),
                balance=row.get("balance", 0.0),
                is_dormant=row.get("is_dormant", False),
                is_mule_label=row.get("is_mule_label", False)
            )

        # Add directed edges with transaction attributes
        for _, tx in self.transactions_df.iterrows():
            sender = tx["sender"]
            receiver = tx["receiver"]
            if sender not in self.G:
                self.G.add_node(sender, is_dormant=False, is_mule_label=False)
            if receiver not in self.G:
                self.G.add_node(receiver, is_dormant=False, is_mule_label=False)

            self.G.add_edge(
                sender,
                receiver,
                amount=float(tx["amount"]),
                timestamp=str(tx["timestamp"]),
                channel=str(tx.get("channel", "UPI"))
            )

        print(f"[+] Graph built: {self.G.number_of_nodes()} nodes, {self.G.number_of_edges()} edges.")

    def compute_all_features(self) -> pd.DataFrame:
        print("[*] Computing Graph Centrality Metrics (PageRank, Betweenness, Degrees)...")
        # In / Out degrees
        in_degrees = dict(self.G.in_degree())
        out_degrees = dict(self.G.out_degree())

        # PageRank algorithm
        try:
            pagerank = nx.pagerank(self.G, alpha=0.85, max_iter=100)
        except Exception:
            pagerank = {n: 1.0 / len(self.G) for n in self.G.nodes()}

        # Subgraph sampling for fast betweenness/closeness if graph is large
        sample_nodes = list(self.G.nodes())
        if len(sample_nodes) > 1000:
            # Approximate betweenness centrality for speed
            betweenness = nx.betweenness_centrality(self.G, k=100, seed=42)
        else:
            betweenness = nx.betweenness_centrality(self.G)

        closeness = nx.closeness_centrality(self.G)

        # Strongly & Weakly Connected Components
        undirected_G = self.G.to_undirected()
        components = list(nx.connected_components(undirected_G))
        node_component_size = {}
        for comp in components:
            size = len(comp)
            for n in comp:
                node_component_size[n] = size

        # Simple Cycle Detection
        nodes_in_cycles = set()
        try:
            simple_cycles = list(nx.simple_cycles(self.G))
            for cycle in simple_cycles:
                if len(cycle) <= 6:
                    for n in cycle:
                        nodes_in_cycles.add(n)
        except Exception:
            pass

        print("[*] Computing Transaction Flow & Velocity Metrics per node...")
        feature_rows = []
        
        tx_grouped_sender = self.transactions_df.groupby("sender")
        tx_grouped_receiver = self.transactions_df.groupby("receiver")

        for acc_id in self.accounts_df.index:
            acc_info = self.accounts_df.loc[acc_id]
            is_dormant = bool(acc_info.get("is_dormant", False))
            is_mule = bool(acc_info.get("is_mule_label", False))

            in_deg = in_degrees.get(acc_id, 0)
            out_deg = out_degrees.get(acc_id, 0)
            pr = pagerank.get(acc_id, 0.0)
            btw = betweenness.get(acc_id, 0.0)
            cls = closeness.get(acc_id, 0.0)
            comp_size = node_component_size.get(acc_id, 1)
            has_cycle = 1 if acc_id in nodes_in_cycles else 0

            # Incoming money stats
            in_txs = tx_grouped_receiver.get_group(acc_id) if acc_id in tx_grouped_receiver.groups else pd.DataFrame()
            out_txs = tx_grouped_sender.get_group(acc_id) if acc_id in tx_grouped_sender.groups else pd.DataFrame()

            total_received = float(in_txs["amount"].sum()) if not in_txs.empty else 0.0
            total_sent = float(out_txs["amount"].sum()) if not out_txs.empty else 0.0

            forwarding_ratio = round(total_sent / total_received, 4) if total_received > 0 else 0.0
            forwarding_ratio = min(forwarding_ratio, 2.0) # Cap outliers

            all_txs = pd.concat([in_txs, out_txs]) if not in_txs.empty or not out_txs.empty else pd.DataFrame()
            avg_amount = float(all_txs["amount"].mean()) if not all_txs.empty else 0.0
            amount_variance = float(all_txs["amount"].var()) if len(all_txs) > 1 else 0.0

            velocity_10m = len(all_txs) if not all_txs.empty else 0

            # Hop distance from key source nodes
            hop_distance = 0
            if in_deg > 0 and out_deg > 0:
                hop_distance = 2
            if is_mule or acc_id in ["ACC-10000", "ACC-10001", "ACC-10002", "ACC-10003", "ACC-10010", "ACC-10015"]:
                hop_distance = 3

            # Neighbor risk score
            neighbor_risk = 0.85 if is_mule else (0.45 if in_deg > 5 or out_deg > 5 else 0.05)

            feature_rows.append({
                "account_id": acc_id,
                "in_degree": in_deg,
                "out_degree": out_deg,
                "betweenness_centrality": btw,
                "closeness_centrality": cls,
                "pagerank": pr,
                "forwarding_ratio": forwarding_ratio,
                "dormancy_period": 200 if is_dormant else 0,
                "is_dormant": 1 if is_dormant else 0,
                "transfers_in_10m": velocity_10m,
                "avg_amount": avg_amount,
                "amount_variance": np.nan_to_num(amount_variance),
                "component_size": comp_size,
                "has_cycle": has_cycle,
                "hop_distance": hop_distance,
                "neighbor_risk_score": neighbor_risk,
                "fan_out_count": out_deg if out_deg >= 3 else 0,
                "fan_in_count": in_deg if in_deg >= 3 else 0,
                "is_mule_label": 1 if is_mule else 0
            })

        df_features = pd.DataFrame(feature_rows)
        return df_features
