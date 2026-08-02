"""
Pydantic Schemas for API Request and Response Models.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    username: str
    password: str

class AccountSchema(BaseModel):
    account_id: str
    opened_date: str
    balance: float
    account_type: str
    kyc_status: str
    risk_score: float
    is_dormant: bool
    is_mule_label: Optional[bool] = False

class TransactionSchema(BaseModel):
    transaction_id: str
    sender: str
    receiver: str
    amount: float
    timestamp: str
    channel: str
    status: str = "COMPLETED"
    location: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None

class RiskSummaryResponse(BaseModel):
    total_accounts: int
    total_transactions: int
    flagged_accounts: int
    detected_rings_count: int
    dormant_accounts_count: int
    average_risk_score: float
    graph_nodes: int
    graph_edges: int

class RingDetailResponse(BaseModel):
    ring_id: str
    name: str
    risk_score: float
    total_amount: float
    hop_count: int
    entry_node: str
    exit_node: str
    nodes: List[str]
    flow_sequence: List[str]
    reasons: List[str]
    rule_evaluation: Dict[str, Any]
    ml_prediction: Dict[str, Any]
    graph: Dict[str, Any]

class PredictRequest(BaseModel):
    account_id: str

class AnalyticsResponse(BaseModel):
    timeline: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]
    centrality_metrics: List[Dict[str, Any]]
    top_risk_accounts: List[Dict[str, Any]]
    feature_importance: List[Dict[str, Any]]
    precision_recall_curve: List[Dict[str, Any]]
    confusion_matrix: List[List[int]]
    model_metrics: Dict[str, Any]
