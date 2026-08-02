# 🛡️ Graph-Based Mule Ring Detection System

An enterprise fraud intelligence platform that models financial transaction networks as dynamic directed graphs to detect money-laundering rings (multi-hop rapid forwarding from dormant accounts to cash withdrawals).

---

## 🌟 Key Capabilities

- **Graph Network Modeling**: Models bank accounts as graph nodes and financial transactions as directed edges (`(:Account)-[:TRANSFERRED]->(:Account)`).
- **Synthetic Data Generator Engine**: Generates 10,000 synthetic bank accounts and 100,000 directed transactions with injected multi-hop laundering rings.
- **Explainable Fraud Rule Engine**: Evaluates accounts against 10+ explicit fraud signatures (Dormancy > 180 days, Rapid Forwarding Ratio > 80%, 10-minute velocity limits, Circular Loops, Fan-in/out patterns) returning exact explanation strings.
- **XGBoost ML & SHAP Explainer**: Trains an XGBoost classifier on graph topological features (PageRank, Betweenness Centrality, Closeness, Hop Distance) and generates SHAP waterfall feature importance explanations.
- **Enterprise React Dashboard**: Built with React 19, TypeScript, Vite, Tailwind CSS, Cytoscape.js interactive network explorer, and Recharts analytical charts.
- **Instant Demo View**: Automatically loads **Flagged Mule Ring #1 (Risk Score: 94%)** on launch with step-by-step money flow sequence (`ACC-10000 (Dormant) → ACC-10001 → ACC-10002 → ACC-10003 → ATM Withdrawal`).

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │          React 19 + TypeScript           │
                      │   (Cytoscape.js, Recharts, Zustand)      │
                      └────────────────────┬─────────────────────┘
                                           │ REST API (JWT)
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │             FastAPI Backend              │
                      │  - Rule Engine                           │
                      │  - XGBoost ML & SHAP Predictor           │
                      │  - Graph Algorithms (BFS/DFS/PageRank)   │
                      └──────────────┬──────────────┬────────────┘
                                     │              │
                    Cypher Queries   │              │ Python Memory
                                     ▼              ▼
                      ┌──────────────────┐  ┌──────────────────┐
                      │  Neo4j Database  │  │ NetworkX Engine  │
                      └──────────────────┘  └──────────────────┘
```

---

## 🚀 Quick Start Guide

### Option 1: Running with Docker Compose (Recommended)

To launch the entire platform (Frontend, FastAPI Backend, and Neo4j Database) with a single command:

```bash
docker-compose up --build
```

Access services at:
- **React Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Neo4j Browser**: [http://localhost:7474](http://localhost:7474) (Credentials: `neo4j` / `mulepass123`)

---

### Option 2: Running Locally

#### 1. Backend & ML Model Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Generate synthetic dataset (10k accounts, 100k txns) & train XGBoost ML model
python ml/train.py

# Start FastAPI backend server
uvicorn backend.app.main:app --reload --port 8000
```

#### 2. Frontend Dashboard Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Test Suite

```bash
# Run unit & integration tests
pytest tests/ -v
```

---

## 📊 API Endpoint Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate fraud analyst & receive JWT token |
| `GET` | `/api/v1/health` | System & database health status |
| `GET` | `/api/v1/risk-summary` | High-level metrics for dashboard cards |
| `GET` | `/api/v1/accounts` | Paginated accounts with risk score & dormancy filters |
| `GET` | `/api/v1/transactions` | Paginated transaction log |
| `POST` | `/api/v1/detect-ring` | Run graph algorithms & return detected mule rings |
| `GET` | `/api/v1/ring/{id}` | Return subnetwork graph & money flow sequence for a ring |
| `POST` | `/api/v1/predict` | Real-time ML risk prediction & SHAP waterfall for an account |
| `GET` | `/api/v1/analytics` | Aggregated analytical charts (timeline, PR curve, confusion matrix) |
| `POST` | `/api/v1/generate-data` | Re-trigger synthetic dataset generator |

---

## 📄 License

MIT License - Developed for Fraud Intelligence & Financial Crime Analytics.
