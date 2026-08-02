"""
XGBoost Machine Learning Pipeline for Mule Ring Detection.
Trains a classifier on graph topology features + account metrics and computes SHAP explanations.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)
import shap

from generator.synthetic_generator import generate_synthetic_data, DATASET_DIR
from ml.feature_extractor import GraphFeatureExtractor

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_artifacts")

FEATURE_COLUMNS = [
    "in_degree", "out_degree", "betweenness_centrality", "closeness_centrality",
    "pagerank", "forwarding_ratio", "dormancy_period", "is_dormant",
    "transfers_in_10m", "avg_amount", "amount_variance", "component_size",
    "has_cycle", "hop_distance", "neighbor_risk_score", "fan_out_count", "fan_in_count"
]

def train_mule_detection_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    accounts_csv = os.path.join(DATASET_DIR, "accounts.csv")
    transactions_csv = os.path.join(DATASET_DIR, "transactions.csv")

    if not os.path.exists(accounts_csv) or not os.path.exists(transactions_csv):
        print("[*] Datasets not found. Generating synthetic dataset...")
        accounts_df, transactions_df, _ = generate_synthetic_data()
    else:
        print("[*] Loading synthetic datasets from disk...")
        accounts_df = pd.read_csv(accounts_csv)
        transactions_df = pd.read_csv(transactions_csv)

    print("[*] Extracting graph topological and behavioral features...")
    extractor = GraphFeatureExtractor(accounts_df, transactions_df)
    features_df = extractor.compute_all_features()

    X = features_df[FEATURE_COLUMNS].copy()
    y = features_df["is_mule_label"].copy()

    # Train / Test split (80 / 20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"[*] Training XGBoost Mule Ring Classifier on {len(X_train)} samples...")
    scale_pos_weight = (len(y_train) - sum(y_train)) / max(sum(y_train), 1)
    
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train_scaled, y_train)

    # Predictions & Evaluation
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    feature_importances = dict(zip(FEATURE_COLUMNS, [float(v) for v in model.feature_importances_]))

    print("\n=========================================")
    print("      MODEL EVALUATION RESULTS          ")
    print("=========================================")
    print(f"  Accuracy:         {acc * 100:.2f}%")
    print(f"  Precision:        {prec * 100:.2f}%")
    print(f"  Recall:           {rec * 100:.2f}%")
    print(f"  F1 Score:         {f1 * 100:.2f}%")
    print(f"  ROC AUC:          {auc * 100:.2f}%")
    print(f"  Confusion Matrix: {cm}")
    print("=========================================\n")

    # Compute SHAP TreeExplainer
    print("[*] Computing SHAP explainer values...")
    explainer = shap.TreeExplainer(model)

    # Save artifacts
    model_path = os.path.join(MODEL_DIR, "xgboost_mule_model.pkl")
    scaler_path = os.path.join(MODEL_DIR, "feature_scaler.pkl")
    explainer_path = os.path.join(MODEL_DIR, "shap_explainer.pkl")
    features_path = os.path.join(MODEL_DIR, "feature_names.json")
    metrics_path = os.path.join(MODEL_DIR, "metrics.json")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(explainer, explainer_path)

    with open(features_path, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    metrics_payload = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": auc,
        "confusion_matrix": cm,
        "feature_importances": feature_importances,
        "sample_counts": {"train": len(X_train), "test": len(X_test)}
    }
    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"[+] Model artifacts saved successfully to {MODEL_DIR}")
    return metrics_payload

if __name__ == "__main__":
    train_mule_detection_model()
