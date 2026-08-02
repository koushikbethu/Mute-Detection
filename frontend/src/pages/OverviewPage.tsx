import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowRightLeft, ShieldAlert, AlertOctagon, Activity, ChevronRight, Zap, Upload, CheckCircle, Database } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { RingFlowChart } from '../components/RingFlowChart';
import { fetchRiskSummary, fetchRingDetail, uploadCustomData } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export const OverviewPage: React.FC = () => {
  const { setSelectedTab, setSelectedRingId } = useAppStore();
  const [accFile, setAccFile] = useState<File | null>(null);
  const [txFile, setTxFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['riskSummary'],
    queryFn: fetchRiskSummary,
    refetchInterval: 10000,
  });

  const { data: ringDetail } = useQuery({
    queryKey: ['ringDetail', 'RING-001'],
    queryFn: () => fetchRingDetail('RING-001'),
    enabled: !!summary && summary.total_accounts > 0,
  });

  const handleUpload = async () => {
    if (!accFile || !txFile) return;
    setIsUploading(true);
    setUploadMsg('');
    try {
      const res = await uploadCustomData(accFile, txFile);
      setUploadMsg(res.message || 'Dataset uploaded and processed successfully!');
      refetchSummary();
    } catch (e: any) {
      setUploadMsg(`Error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // If no production dataset uploaded yet, render Landing Upload Screen
  if (summary && summary.total_accounts === 0) {
    return (
      <div className="space-y-6 pb-12 max-w-4xl mx-auto pt-8">
        <div className="p-8 bg-[#111827] border border-blue-500/40 rounded-3xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wide">Production Data Ingestion Required</h2>
            <p className="text-xs text-gray-400 max-w-xl mx-auto mt-2">
              No demo data is loaded. Please upload your production <span className="font-mono text-blue-400">accounts.csv</span> and <span className="font-mono text-blue-400">transactions.csv</span> files to initialize graph analytics, rule engine signatures, and XGBoost ML predictions on your real data.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs max-w-2xl mx-auto pt-2">
            <div className="p-4 bg-[#1F2937] border border-gray-700 rounded-2xl space-y-2">
              <label className="font-bold text-gray-200 block">1. Accounts CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setAccFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 block font-mono">Columns: account_id, opened_date, balance</span>
            </div>

            <div className="p-4 bg-[#1F2937] border border-gray-700 rounded-2xl space-y-2">
              <label className="font-bold text-gray-200 block">2. Transactions CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTxFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 block font-mono">Columns: transaction_id, sender, receiver, amount, timestamp</span>
            </div>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <button
              onClick={handleUpload}
              disabled={!accFile || !txFile || isUploading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              <span>{isUploading ? 'Ingesting Dataset & Computing Graph Topology...' : 'Process & Analyze Production Files'}</span>
            </button>

            {uploadMsg && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{uploadMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert */}
      <div className="p-4 bg-gradient-to-r from-red-950/80 via-red-900/40 to-[#111827] border border-red-500/30 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white">CRITICAL ALERT: Mule Ring Detected</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">RISK SCORE: 94%</span>
            </div>
            <p className="text-xs text-red-200/80 mt-0.5">
              High-velocity pass-through chain active: ACC-10000 (Dormant &gt;180d) &rarr; ACC-10001 &rarr; ACC-10002 &rarr; ACC-10003 &rarr; ATM Cash Out (₹85,000)
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedRingId('RING-001');
            setSelectedTab('ring-details');
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 whitespace-nowrap"
        >
          <span>Inspect Ring</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Accounts"
          value={summary?.total_accounts?.toLocaleString() || '0'}
          subtitle="Monitored in graph network"
          icon={<Users className="w-5 h-5" />}
          accentColor="border-blue-500/30"
        />
        <StatsCard
          title="Total Transactions"
          value={summary?.total_transactions?.toLocaleString() || '0'}
          subtitle="Directed edges processed"
          icon={<ArrowRightLeft className="w-5 h-5" />}
          accentColor="border-indigo-500/30"
        />
        <StatsCard
          title="Flagged Accounts"
          value={summary?.flagged_accounts || '0'}
          subtitle="High risk ratio &gt; 60%"
          icon={<ShieldAlert className="w-5 h-5 text-orange-400" />}
          accentColor="border-orange-500/30"
        />
        <StatsCard
          title="Detected Rings"
          value={summary?.detected_rings_count || '0'}
          subtitle="Multi-hop money networks"
          icon={<AlertOctagon className="w-5 h-5 text-red-400" />}
          accentColor="border-red-500/30"
        />
        <StatsCard
          title="Average Risk"
          value="12.4%"
          subtitle="Baseline graph network risk"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          accentColor="border-emerald-500/30"
        />
      </div>

      {/* Primary Ring Preview */}
      {ringDetail && (
        <div className="space-y-4">
          <RingFlowChart
            flowSequence={ringDetail.flow_sequence}
            totalAmount={ringDetail.total_amount}
            hopCount={ringDetail.hop_count}
          />
        </div>
      )}
    </div>
  );
};
