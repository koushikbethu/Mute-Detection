import axios from 'axios';
import { RiskSummary, RingDetail, Account, Transaction, AnalyticsData } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for large datasets
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchRiskSummary = async (): Promise<RiskSummary> => {
  const { data } = await apiClient.get<RiskSummary>('/risk-summary');
  return data;
};

export const fetchRingDetail = async (ringId: string): Promise<RingDetail> => {
  const { data } = await apiClient.get<RingDetail>(`/ring/${ringId}`);
  return data;
};

export const fetchAccounts = async (page = 1, limit = 50, dormantOnly = false, highRiskOnly = false) => {
  const { data } = await apiClient.get('/accounts', {
    params: { page, limit, dormant_only: dormantOnly, high_risk_only: highRiskOnly }
  });
  return data;
};

export const fetchTransactions = async (page = 1, limit = 50, accountId?: string) => {
  const { data } = await apiClient.get('/transactions', {
    params: { page, limit, account_id: accountId }
  });
  return data;
};

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const { data } = await apiClient.get<AnalyticsData>('/analytics');
  return data;
};

export const predictAccountRisk = async (accountId: string) => {
  const { data } = await apiClient.post('/predict', { account_id: accountId });
  return data;
};

export const triggerDataRegeneration = async () => {
  const { data } = await apiClient.post('/generate-data');
  return data;
};

export const uploadCustomData = async (accountsFile: File, transactionsFile: File) => {
  const formData = new FormData();
  formData.append('accounts_file', accountsFile);
  formData.append('transactions_file', transactionsFile);

  const { data } = await apiClient.post('/upload-data', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const resetSessionData = async () => {
  const { data } = await apiClient.post('/reset-session');
  return data;
};
