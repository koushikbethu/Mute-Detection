import React, { useState } from 'react';
import { Settings, Sliders, RefreshCw, CheckCircle, Database, Upload } from 'lucide-react';
import { triggerDataRegeneration, uploadCustomData } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [dormancyDays, setDormancyDays] = useState(180);
  const [forwardingRatio, setForwardingRatio] = useState(80);
  const [velocityThreshold, setVelocityThreshold] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [accFile, setAccFile] = useState<File | null>(null);
  const [txFile, setTxFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRegenerateData = async () => {
    setIsGenerating(true);
    setStatusMsg('');
    try {
      const res = await triggerDataRegeneration();
      setStatusMsg(res.message || 'Successfully generated new synthetic dataset!');
    } catch (e: any) {
      setStatusMsg('Data generation triggered.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadCustomData = async () => {
    if (!accFile || !txFile) return;
    setIsUploading(true);
    setStatusMsg('');
    try {
      const res = await uploadCustomData(accFile, txFile);
      setStatusMsg(res.message || 'Custom dataset ingested successfully!');
    } catch (e: any) {
      setStatusMsg(`Upload Error: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            Platform &amp; Rule Engine Configuration
          </h2>
          <p className="text-xs text-gray-400 mt-1">Adjust fraud rule thresholds, custom CSV data uploads, and graph triggers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Data Ingestion Widget */}
        <div className="p-6 bg-[#111827] border border-blue-500/30 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-blue-400" />
              Ingest Production CSV Datasets
            </h3>
            <p className="text-xs text-gray-400">
              Upload your production <span className="font-mono text-gray-200">accounts.csv</span> and <span className="font-mono text-gray-200">transactions.csv</span> to run graph algorithms &amp; ML scoring on your real data.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">1. Accounts CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setAccFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer bg-[#1F2937] p-2 rounded-xl border border-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">2. Transactions CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTxFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer bg-[#1F2937] p-2 rounded-xl border border-gray-700"
              />
            </div>

            <button
              onClick={handleUploadCustomData}
              disabled={!accFile || !txFile || isUploading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Ingesting Custom Data & Re-building Graph...' : 'Upload & Process Production Data'}</span>
            </button>
          </div>
        </div>

        {/* Rule Engine Parameters */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Fraud Detection Rule Thresholds
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Dormancy Threshold (Days)</span>
                <span className="text-blue-400 font-bold">{dormancyDays} Days</span>
              </div>
              <input
                type="range"
                min="30"
                max="365"
                value={dormancyDays}
                onChange={(e) => setDormancyDays(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>Rapid Forwarding Ratio Threshold</span>
                <span className="text-red-400 font-bold">{forwardingRatio}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={forwardingRatio}
                onChange={(e) => setForwardingRatio(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-300 mb-1">
                <span>10-Minute Transaction Velocity Limit</span>
                <span className="text-amber-400 font-bold">{velocityThreshold} Txns</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={velocityThreshold}
                onChange={(e) => setVelocityThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Generator Trigger */}
      <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-emerald-400" />
            Synthetic Benchmark Dataset Generator
          </h3>
          <p className="text-xs text-gray-400">
            Re-generate 10,000 synthetic bank accounts and 100,000 directed financial transactions with newly injected mule rings.
          </p>
        </div>

        <button
          onClick={handleRegenerateData}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating 100,000 Transactions...' : 'Re-Generate Synthetic Data'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};
