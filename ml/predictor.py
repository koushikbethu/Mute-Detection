"""
Machine Learning & SHAP Predictor for Mule Ring Detection.
Provides real-time inference and feature importance explanations for accounts.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, List, Any

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_artifacts")

class MulePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.explainer = None
        self.feature_names = []
        self.metrics = {}
        self.is_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(MODEL_DIR, "xgboost_mule_model.pkl")
        scaler_path = os.path.join(MODEL_DIR, "feature_scaler.pkl")
        explainer_path = os.path.join(MODEL_DIR, "shap_explainer.pkl")
        features_path = os.path.join(MODEL_DIR, "feature_names.json")
        metrics_path = os.path.join(MODEL_DIR, "metrics.json")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                if os.path.exists(explainer_path):
                    self.explainer = joblib.load(explainer_path)
                if os.path.exists(features_path):
                    with open(features_path, "r") as f:
                        self.feature_names = json.load(f)
                if os.path.exists(metrics_path):
                    with open(metrics_path, "r") as f:
                        self.metrics = json.load(f)
                self.is_loaded = True
                print("[+] MulePredictor successfully loaded XGBoost model & SHAP artifacts.")
            except Exception as e:
                print(f"[!] Warning: Failed to load ML artifacts: {e}")
                self.is_loaded = False

    def predict_account(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded or self.scaler is None or self.model is None:
            self._load_artifacts()

        if not self.feature_names:
            self.feature_names = [
                "in_degree", "out_degree", "betweenness_centrality", "closeness_centrality",
                "pagerank", "forwarding_ratio", "dormancy_period", "is_dormant",
                "transfers_in_10m", "avg_amount", "amount_variance", "component_size",
                "has_cycle", "hop_distance", "neighbor_risk_score", "fan_out_count", "fan_in_count"
            ]

        # Build feature vector
        vector = [features_dict.get(fname, 0.0) for fname in self.feature_names]

        if self.scaler is None or self.model is None:
            # Fallback heuristic prediction if model is not yet saved to disk
            f_ratio = float(features_dict.get("forwarding_ratio", 0.0))
            is_dorm = float(features_dict.get("is_dormant", 0))
            prob = min(round(f_ratio * 0.5 + is_dorm * 0.45, 4), 0.94)
            
            shap_contributions = [
                {"feature": "forwarding_ratio", "shap_value": 0.45, "feature_value": f_ratio, "impact": "INCREASES_RISK"},
                {"feature": "dormancy_period", "shap_value": 0.35, "feature_value": is_dorm * 200, "impact": "INCREASES_RISK"},
                {"feature": "transfers_in_10m", "shap_value": 0.15, "feature_value": float(features_dict.get("transfers_in_10m", 0)), "impact": "INCREASES_RISK"}
            ]
            return {
                "ml_risk_score": prob,
                "risk_category": "CRITICAL" if prob >= 0.85 else ("HIGH" if prob >= 0.65 else ("MEDIUM" if prob >= 0.35 else "LOW")),
                "shap_explanations": shap_contributions,
                "is_model_active": False
            }

        X_df = pd.DataFrame([vector], columns=self.feature_names)
        X_scaled = self.scaler.transform(X_df)

        prob = float(self.model.predict_proba(X_scaled)[0, 1])

        shap_contributions = []
        if self.explainer is not None:
            try:
                shap_vals = self.explainer.shap_values(X_scaled)
                if isinstance(shap_vals, list):
                    shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]
                if len(shap_vals.shape) > 1:
                    shap_vals = shap_vals[0]

                for fname, val, fval in zip(self.feature_names, shap_vals, vector):
                    shap_contributions.append({
                        "feature": fname,
                        "shap_value": round(float(val), 4),
                        "feature_value": float(fval),
                        "impact": "INCREASES_RISK" if val > 0 else "DECREASES_RISK"
                    })
                shap_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
            except Exception as e:
                print(f"[!] SHAP calculation note: {e}")

        if not shap_contributions and self.model and hasattr(self.model, "feature_importances_"):
            for fname, imp, fval in zip(self.feature_names, self.model.feature_importances_, vector):
                shap_contributions.append({
                    "feature": fname,
                    "shap_value": round(float(imp * prob), 4),
                    "feature_value": float(fval),
                    "impact": "INCREASES_RISK" if imp > 0.05 else "DECREASES_RISK"
                })
            shap_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        risk_category = "CRITICAL" if prob >= 0.85 else ("HIGH" if prob >= 0.65 else ("MEDIUM" if prob >= 0.35 else "LOW"))

        return {
            "ml_risk_score": round(prob, 4),
            "risk_category": risk_category,
            "shap_explanations": shap_contributions[:6], # Top 6 features
            "is_model_active": True
        }

    def get_metrics(self) -> Dict[str, Any]:
        return self.metrics

# Global singleton
mule_predictor = MulePredictor()
