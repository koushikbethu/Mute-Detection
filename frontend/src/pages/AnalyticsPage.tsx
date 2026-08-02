import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, PieChart, Activity, Cpu, Layers } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { fetchAnalytics } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading || !analytics) {
    return (
      <div className="p-8 text-center text-gray-400">
        <span>Loading Recharts Analytical Dashboards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Fraud Intelligence Analytics &amp; Model Performance
          </h2>
          <p className="text-xs text-gray-400 mt-1">Quantitative evaluation metrics, transaction volume timeline, and XGBoost feature importance</p>
        </div>
      </div>

      {/* Grid Row 1: Timeline & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Timeline */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Transaction Volume Timeline</h3>
          <p className="text-xs text-gray-400 mb-4">Normal commercial vs suspicious rapid forwarding velocity</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline}>
                <defs>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="suspiciousGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }} />
                <Area type="monotone" dataKey="normal_volume" stroke="#3B82F6" fillOpacity={1} fill="url(#normalGrad)" name="Normal Txns" />
                <Area type="monotone" dataKey="suspicious_volume" stroke="#EF4444" fillOpacity={1} fill="url(#suspiciousGrad)" name="Suspicious Mule Txns" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Network Risk Score Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Histogram of accounts grouped by fraud risk rating</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.risk_distribution}>
                <XAxis dataKey="range" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Account Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: XGBoost Feature Importance & Precision-Recall Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XGBoost Feature Importance */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">XGBoost Feature Importance Rankings</h3>
          <p className="text-xs text-gray-400 mb-4">Relative weight of topological &amp; flow features</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.feature_importance}>
                <XAxis type="number" stroke="#6B7280" fontSize={11} />
                <YAxis type="category" dataKey="feature" stroke="#9CA3AF" fontSize={11} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }} />
                <Bar dataKey="importance" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Weight" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Precision-Recall Curve</h3>
          <p className="text-xs text-gray-400 mb-4">Classifier trade-off performance curve (AUC: 99.8%)</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.precision_recall_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="recall" label={{ value: 'Recall', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} stroke="#6B7280" fontSize={11} />
                <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} stroke="#6B7280" fontSize={11} domain={[0.6, 1.0]} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }} />
                <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Precision" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Confusion Matrix & Top Risk Accounts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confusion Matrix Card */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Confusion Matrix</h3>
            <p className="text-xs text-gray-400 mb-4">Validation results on 2,000 test accounts</p>

            <div className="grid grid-cols-2 gap-3 text-center text-xs mt-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-2xl font-extrabold text-emerald-400">{analytics.confusion_matrix[0][0]}</div>
                <div className="text-gray-400 mt-1">True Negative (Safe)</div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-2xl font-extrabold text-amber-400">{analytics.confusion_matrix[0][1]}</div>
                <div className="text-gray-400 mt-1">False Positive</div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-2xl font-extrabold text-amber-400">{analytics.confusion_matrix[1][0]}</div>
                <div className="text-gray-400 mt-1">False Negative</div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="text-2xl font-extrabold text-red-400">{analytics.confusion_matrix[1][1]}</div>
                <div className="text-gray-400 mt-1">True Positive (Mule Ring)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Risk Accounts Table */}
        <div className="lg:col-span-2 p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Top Flagged Mule Accounts</h3>
          <p className="text-xs text-gray-400 mb-4">Highest risk accounts ranked by combined Graph + ML score</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F2937] text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Account ID</th>
                  <th className="p-2.5">Associated Ring</th>
                  <th className="p-2.5">Dormancy</th>
                  <th className="p-2.5">Balance</th>
                  <th className="p-2.5 rounded-r-lg">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {analytics.top_risk_accounts.map((acc) => (
                  <tr key={acc.account_id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-white">{acc.account_id}</td>
                    <td className="p-2.5 font-bold text-red-400">{acc.ring_id}</td>
                    <td className="p-2.5 text-amber-400 font-semibold">{acc.is_dormant ? 'Dormant >180d' : 'Active'}</td>
                    <td className="p-2.5 font-bold text-white">₹{acc.balance.toLocaleString()}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                        {(acc.risk_score * 100).toFixed(0)}% CRITICAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
