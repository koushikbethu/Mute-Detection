export interface Account {
  account_id: string;
  opened_date: string;
  balance: number;
  account_type: 'SAVINGS' | 'CURRENT' | 'SALARY' | 'DIGITAL';
  kyc_status: string;
  risk_score: number;
  is_dormant: boolean;
  is_mule_label?: boolean;
}

export interface Transaction {
  transaction_id: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: string;
  channel: string;
  status: string;
  location?: string;
  device_id?: string;
  ip_address?: string;
}

export interface RuleTrigger {
  rule_id: string;
  rule_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  actual_value: string | number;
  threshold_value: string | number;
  explanation: string;
}

export interface RuleEvaluation {
  rule_risk_score: number;
  triggered_count: number;
  triggered_rules: RuleTrigger[];
}

export interface ShapExplanation {
  feature: string;
  shap_value: number;
  feature_value: number;
  impact: 'INCREASES_RISK' | 'DECREASES_RISK';
}

export interface MLPrediction {
  ml_risk_score: number;
  risk_category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  shap_explanations: ShapExplanation[];
  is_model_active: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  balance: number;
  account_type: string;
  is_dormant: boolean;
  risk_score: number;
  color: string;
  in_degree: number;
  out_degree: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  channel: string;
}

export interface RingDetail {
  ring_id: string;
  name: string;
  risk_score: number;
  total_amount: number;
  hop_count: number;
  entry_node: string;
  exit_node: string;
  nodes: string[];
  flow_sequence: string[];
  reasons: string[];
  rule_evaluation: RuleEvaluation;
  ml_prediction: MLPrediction;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface RiskSummary {
  total_accounts: number;
  total_transactions: number;
  flagged_accounts: number;
  detected_rings_count: number;
  dormant_accounts_count: number;
  average_risk_score: number;
  graph_nodes: number;
  graph_edges: number;
}

export interface AnalyticsData {
  timeline: { timestamp: string; normal_volume: number; suspicious_volume: number }[];
  risk_distribution: { range: string; count: number }[];
  centrality_metrics: { node: string; betweenness: number; pagerank: number; closeness: number }[];
  top_risk_accounts: { account_id: string; risk_score: number; ring_id: string; balance: number; is_dormant: boolean }[];
  feature_importance: { feature: string; importance: number }[];
  precision_recall_curve: { recall: number; precision: number }[];
  confusion_matrix: number[][];
  model_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
}
