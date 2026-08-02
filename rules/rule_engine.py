"""
Explainable Rule Engine for Mule Ring Detection.
Evaluates account metadata and graph topology against explicit fraud signatures.
"""

from typing import Dict, List, Any

class RuleEngine:
    def __init__(self):
        self.rules = [
            {
                "id": "RULE_001",
                "name": "Dormancy Period Exceeded",
                "severity": "HIGH",
                "weight": 25,
                "eval": self._eval_dormancy
            },
            {
                "id": "RULE_002",
                "name": "High Rapid Inflow Velocity",
                "severity": "CRITICAL",
                "weight": 30,
                "eval": self._eval_inflow_velocity
            },
            {
                "id": "RULE_003",
                "name": "High Forwarding Ratio",
                "severity": "CRITICAL",
                "weight": 35,
                "eval": self._eval_forwarding_ratio
            },
            {
                "id": "RULE_004",
                "name": "High Graph In-Degree",
                "severity": "MEDIUM",
                "weight": 15,
                "eval": self._eval_in_degree
            },
            {
                "id": "RULE_005",
                "name": "High Graph Out-Degree",
                "severity": "MEDIUM",
                "weight": 15,
                "eval": self._eval_out_degree
            },
            {
                "id": "RULE_006",
                "name": "Repeated Fan-Out Pattern",
                "severity": "HIGH",
                "weight": 20,
                "eval": self._eval_fan_out
            },
            {
                "id": "RULE_007",
                "name": "Repeated Fan-In Pattern",
                "severity": "HIGH",
                "weight": 20,
                "eval": self._eval_fan_in
            },
            {
                "id": "RULE_008",
                "name": "Circular Money Loop",
                "severity": "CRITICAL",
                "weight": 30,
                "eval": self._eval_circular
            },
            {
                "id": "RULE_009",
                "name": "Multi-Hop Pass-Through Chain",
                "severity": "HIGH",
                "weight": 25,
                "eval": self._eval_multihop
            },
            {
                "id": "RULE_010",
                "name": "Risk Propagation Signal",
                "severity": "MEDIUM",
                "weight": 15,
                "eval": self._eval_risk_propagation
            }
        ]

    def _eval_dormancy(self, data: Dict[str, Any]) -> Dict[str, Any]:
        is_dormant = bool(data.get("is_dormant", False))
        return {
            "triggered": is_dormant,
            "actual": "Dormant (Inactive > 180 days)" if is_dormant else "Active",
            "threshold": "Inactive > 180 days",
            "explanation": "Account was dormant for over 180 days before sudden high-volume transaction activity." if is_dormant else "Account active."
        }

    def _eval_inflow_velocity(self, data: Dict[str, Any]) -> Dict[str, Any]:
        velocity = data.get("transfers_in_10m", 0)
        threshold = 5
        triggered = velocity >= threshold
        return {
            "triggered": triggered,
            "actual": f"{velocity} transfers in 10m",
            "threshold": f">= {threshold} transfers",
            "explanation": f"Received {velocity} transfers within a 10-minute window, exceeding the threshold of {threshold}." if triggered else "Velocity normal."
        }

    def _eval_forwarding_ratio(self, data: Dict[str, Any]) -> Dict[str, Any]:
        ratio = data.get("forwarding_ratio", 0.0)
        threshold = 0.80
        triggered = ratio >= threshold
        return {
            "triggered": triggered,
            "actual": f"{ratio * 100:.1f}%",
            "threshold": f">= {threshold * 100:.0f}%",
            "explanation": f"Forwarded {ratio*100:.1f}% of received funds within 15 minutes of receipt (mule pass-through behavior)." if triggered else "Forwarding ratio within limits."
        }

    def _eval_in_degree(self, data: Dict[str, Any]) -> Dict[str, Any]:
        in_degree = data.get("in_degree", 0)
        threshold = 6
        triggered = in_degree >= threshold
        return {
            "triggered": triggered,
            "actual": in_degree,
            "threshold": f">= {threshold}",
            "explanation": f"High node in-degree of {in_degree} incoming transaction connections." if triggered else "In-degree normal."
        }

    def _eval_out_degree(self, data: Dict[str, Any]) -> Dict[str, Any]:
        out_degree = data.get("out_degree", 0)
        threshold = 6
        triggered = out_degree >= threshold
        return {
            "triggered": triggered,
            "actual": out_degree,
            "threshold": f">= {threshold}",
            "explanation": f"High node out-degree of {out_degree} outgoing transaction connections." if triggered else "Out-degree normal."
        }

    def _eval_fan_out(self, data: Dict[str, Any]) -> Dict[str, Any]:
        fan_out = data.get("fan_out_count", 0)
        threshold = 3
        triggered = fan_out >= threshold
        return {
            "triggered": triggered,
            "actual": fan_out,
            "threshold": f">= {threshold}",
            "explanation": f"Dispersed incoming funds concurrently to {fan_out} distinct accounts (smurfing pattern)." if triggered else "No fan-out anomaly."
        }

    def _eval_fan_in(self, data: Dict[str, Any]) -> Dict[str, Any]:
        fan_in = data.get("fan_in_count", 0)
        threshold = 3
        triggered = fan_in >= threshold
        return {
            "triggered": triggered,
            "actual": fan_in,
            "threshold": f">= {threshold}",
            "explanation": f"Aggregated funds concurrently from {fan_in} intermediate accounts (consolidation pattern)." if triggered else "No fan-in anomaly."
        }

    def _eval_circular(self, data: Dict[str, Any]) -> Dict[str, Any]:
        has_cycle = bool(data.get("has_cycle", False))
        return {
            "triggered": has_cycle,
            "actual": "Cycle Detected" if has_cycle else "Acyclic Flow",
            "threshold": "Cycle Present",
            "explanation": "Participates in a closed circular money transaction loop (A -> B -> C -> A)." if has_cycle else "No cycle detected."
        }

    def _eval_multihop(self, data: Dict[str, Any]) -> Dict[str, Any]:
        hop_count = data.get("hop_distance", 0)
        threshold = 3
        triggered = hop_count >= threshold
        return {
            "triggered": triggered,
            "actual": f"{hop_count} hops",
            "threshold": f">= {threshold} hops",
            "explanation": f"Account is part of a multi-hop layered transaction chain ({hop_count} sequential hops)." if triggered else "Hop count normal."
        }

    def _eval_risk_propagation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        neighbor_risk = data.get("neighbor_risk_score", 0.0)
        threshold = 0.50
        triggered = neighbor_risk >= threshold
        return {
            "triggered": triggered,
            "actual": f"{neighbor_risk * 100:.1f}%",
            "threshold": f">= {threshold * 100:.0f}%",
            "explanation": f"Connected to high-risk graph neighbors with average risk score of {neighbor_risk*100:.1f}%." if triggered else "Neighbor risk low."
        }

    def evaluate_account(self, account_metrics: Dict[str, Any]) -> Dict[str, Any]:
        triggered_rules = []
        total_rule_score = 0.0
        max_score = 0.0

        for r in self.rules:
            res = r["eval"](account_metrics)
            max_score += r["weight"]
            if res["triggered"]:
                total_rule_score += r["weight"]
                triggered_rules.append({
                    "rule_id": r["id"],
                    "rule_name": r["name"],
                    "severity": r["severity"],
                    "weight": r["weight"],
                    "actual_value": res["actual"],
                    "threshold_value": res["threshold"],
                    "explanation": res["explanation"]
                })

        normalized_rule_score = min(round(total_rule_score / max_score, 4), 1.0)

        return {
            "rule_risk_score": normalized_rule_score,
            "triggered_count": len(triggered_rules),
            "triggered_rules": triggered_rules
        }

# Global singleton instance
rule_engine = RuleEngine()
