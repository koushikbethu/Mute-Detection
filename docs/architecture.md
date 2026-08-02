# System Architecture & Graph Schema Documentation

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend["React 19 + Vite Dashboard (Port 5173)"]
        UI["UI Components (Cytoscape.js, Recharts)"]
        Zustand["Zustand Global State"]
        ReactQuery["React Query (Axios API Client)"]
    end

    subgraph Backend["FastAPI Python 3.12 Service (Port 8000)"]
        API["REST Endpoints (/predict, /ring, /accounts)"]
        JWT["JWT Security & Auth"]
        RuleEngine["Explainable Rule Engine"]
        MLPredictor["XGBoost Predictor & SHAP Explainer"]
    end

    subgraph GraphLayer["Graph Storage & Analytics"]
        Neo4j[("Neo4j Database (Port 7687)")]
        NetworkX["In-Memory NetworkX Engine"]
    end

    subgraph Generator["Synthetic Data Generator"]
        DataGen["Data Generator Engine (10k Accounts, 100k Txns)"]
    end

    UI --> ReactQuery
    ReactQuery --> API
    API --> RuleEngine
    API --> MLPredictor
    API --> NetworkX
    API --> Neo4j
    DataGen --> NetworkX
    DataGen --> Neo4j
```

---

## 2. Neo4j Graph Database Schema

### Node Label: `Account`
Properties:
- `account_id` (STRING, UNIQUE INDEX)
- `opened_date` (STRING ISO-8601)
- `balance` (FLOAT)
- `account_type` (STRING: "SAVINGS", "CURRENT", "SALARY", "DIGITAL")
- `kyc_status` (STRING: "VERIFIED", "PENDING", "PARTIAL")
- `risk_score` (FLOAT: 0.0 to 1.0)
- `is_dormant` (BOOLEAN)

### Relationship Type: `TRANSFERRED`
Directed Edge: `(:Account)-[:TRANSFERRED]->(:Account)`
Properties:
- `transaction_id` (STRING)
- `amount` (FLOAT)
- `timestamp` (STRING ISO-8601)
- `channel` (STRING: "UPI", "NET_BANKING", "IMPS", "NEFT", "ATM")
- `location` (STRING)

---

## 3. Mule Ring Detection Flow

1. **Synthetic Data Generation**: Injects realistic multi-hop laundering chains (Dormant >180d $\rightarrow$ Sudden Credit $\rightarrow$ Rapid Forward 95% $\rightarrow$ Intermediate Hops $\rightarrow$ Cash Out).
2. **Graph Topological Feature Extraction**: Computes In/Out Degree, PageRank, Betweenness Centrality, Closeness Centrality, Hop Distance, and Forwarding Ratios.
3. **Hybrid Risk Engine**: Evaluates 10+ explicit fraud signatures in the Rule Engine and combines them with XGBoost ML probabilities & SHAP feature importances.
4. **Interactive Dashboard**: Visualizes flagged rings in Cytoscape.js with step-by-step money flow sequence animations.
