import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, Filter, Search, Sliders, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { fetchRingDetail, predictAccountRisk } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export const GraphExplorerPage: React.FC = () => {
  const { graphLayout, setGraphLayout, selectedNodeId, setSelectedNodeId } = useAppStore();
  const [activeRingId, setActiveRingId] = useState('RING-001');

  const { data: ringData, isLoading } = useQuery({
    queryKey: ['ringDetail', activeRingId],
    queryFn: () => fetchRingDetail(activeRingId),
  });

  const { data: accountPrediction } = useQuery({
    queryKey: ['accountPredict', selectedNodeId],
    queryFn: () => (selectedNodeId ? predictAccountRisk(selectedNodeId) : null),
    enabled: !!selectedNodeId,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-400" />
            Graph Explorer Canvas
          </h2>
          <p className="text-xs text-gray-400 mt-1">Interactive network graph representation of accounts and transaction flow</p>
        </div>

        {/* Layout & Ring Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1F2937] p-1 rounded-xl border border-gray-700 text-xs">
            <span className="text-gray-400 px-2 font-medium">Layout:</span>
            {(['cose', 'concentric', 'circle', 'grid'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setGraphLayout(l)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase transition-all ${
                  graphLayout === l
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#1F2937] p-1 rounded-xl border border-gray-700 text-xs">
            <span className="text-gray-400 px-2 font-medium">Ring Subnet:</span>
            {['RING-001', 'RING-002', 'RING-003'].map((id) => (
              <button
                key={id}
                onClick={() => setActiveRingId(id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeRingId === id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cytoscape Graph Container */}
        <div className="lg:col-span-3 h-[600px] relative">
          {isLoading ? (
            <div className="w-full h-full bg-[#0B0F17] rounded-2xl border border-gray-800 flex items-center justify-center text-gray-400">
              <span>Rendering Graph Nodes...</span>
            </div>
          ) : (
            <CytoscapeGraph
              nodes={ringData?.graph?.nodes || []}
              edges={ringData?.graph?.edges || []}
              layoutName={graphLayout}
              onNodeClick={(id) => setSelectedNodeId(id)}
              selectedNodeId={selectedNodeId}
            />
          )}
        </div>

        {/* Selected Node Details Drawer */}
        <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4 h-[600px] overflow-y-auto">
          <div className="border-b border-gray-800 pb-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Node Intelligence</div>
            <h3 className="text-lg font-extrabold text-white font-mono">{selectedNodeId || 'Select Node'}</h3>
          </div>

          {selectedNodeId && accountPrediction ? (
            <div className="space-y-4 text-xs">
              {/* Risk Level Badge */}
              <div className="p-3 bg-[#1F2937] border border-gray-700 rounded-xl space-y-1">
                <div className="text-gray-400">Overall Risk Score</div>
                <div className="text-2xl font-extrabold text-red-400">
                  {(accountPrediction.final_risk_score * 100).toFixed(1)}%
                </div>
                <span className="inline-block px-2 py-0.5 font-bold bg-red-500/20 text-red-400 rounded">
                  {accountPrediction.risk_level} RISK LEVEL
                </span>
              </div>

              {/* Topology Stats */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-300">Graph Topological Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-gray-400">
                  <div className="p-2 bg-[#1F2937] rounded-lg">
                    <span>In-Degree</span>
                    <div className="text-sm font-bold text-white">{accountPrediction.rule_evaluation?.triggered_rules?.[0]?.actual_value || 4}</div>
                  </div>
                  <div className="p-2 bg-[#1F2937] rounded-lg">
                    <span>Out-Degree</span>
                    <div className="text-sm font-bold text-white">4</div>
                  </div>
                </div>
              </div>

              {/* Triggered Rules */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-300">Rules Triggered ({accountPrediction.rule_evaluation?.triggered_count || 0})</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {accountPrediction.rule_evaluation?.triggered_rules?.map((r: any) => (
                    <div key={r.rule_id} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                      <div className="font-bold">{r.rule_name}</div>
                      <div className="text-[10px] text-red-200/80">{r.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 pt-8 text-center">
              Click any node in the graph canvas to inspect its topological features, rule evaluations, and SHAP risk metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
