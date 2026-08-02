import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, AlertTriangle, Cpu, CheckCircle2, Clock, Landmark, Network } from 'lucide-react';
import { fetchRingDetail } from '../services/api';
import { RingFlowChart } from '../components/RingFlowChart';
import { ShapChart } from '../components/ShapChart';
import { CytoscapeGraph } from '../components/CytoscapeGraph';
import { useAppStore } from '../store/useAppStore';

export const RingDetailsPage: React.FC = () => {
  const { selectedRingId, setSelectedRingId } = useAppStore();

  const { data: ring, isLoading, isError } = useQuery({
    queryKey: ['ringDetail', selectedRingId],
    queryFn: () => fetchRingDetail(selectedRingId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing Graph Subnetwork &amp; Computing Rules...</span>
        </div>
      </div>
    );
  }

  if (isError || !ring) {
    return (
      <div className="p-8 bg-[#111827] border border-gray-800 rounded-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Ring Information Unavailable</h3>
        <p className="text-xs text-gray-400">Could not retrieve detailed subnetwork for ring ID: {selectedRingId}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Selector bar */}
      <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-white">{ring.name}</h2>
            <span className="px-3 py-1 text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 rounded-full animate-pulse">
              RISK SCORE: {(ring.risk_score * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ring ID: <span className="font-mono text-gray-200">{ring.ring_id}</span> | Entry Node: <span className="font-mono text-amber-300">{ring.entry_node}</span> | Exit Node: <span className="font-mono text-red-300">{ring.exit_node}</span>
          </p>
        </div>

        {/* Ring selection tabs */}
        <div className="flex items-center gap-2">
          {['RING-001', 'RING-002', 'RING-003'].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedRingId(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRingId === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#1F2937] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Money Flow Step-by-Step Chain */}
      <RingFlowChart
        flowSequence={ring.flow_sequence}
        totalAmount={ring.total_amount}
        hopCount={ring.hop_count}
      />

      {/* Grid layout: Rules Triggered & SHAP Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triggered Rules Table */}
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Rule Engine Fraud Signals
                </h3>
                <p className="text-xs text-gray-400">Triggered rule explanations explaining WHY account was flagged</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg">
                {ring.rule_evaluation.triggered_count} Rules Fired
              </span>
            </div>

            <div className="space-y-3">
              {ring.rule_evaluation.triggered_rules.map((rule) => (
                <div key={rule.rule_id} className="p-3.5 bg-[#1F2937] border border-red-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded">
                        {rule.severity}
                      </span>
                      <span className="text-xs font-bold text-white">{rule.rule_name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">ID: {rule.rule_id}</span>
                  </div>

                  <p className="text-xs text-red-200/90 pl-1 border-l-2 border-red-500">
                    {rule.explanation}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-1">
                    <span>Actual: <strong className="text-white">{rule.actual_value}</strong></span>
                    <span>Threshold: <strong className="text-gray-300">{rule.threshold_value}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SHAP Explainability Component */}
        <ShapChart explanations={ring.ml_prediction.shap_explanations} />
      </div>

      {/* Interactive Subnetwork Cytoscape Graph */}
      <div className="p-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Interactive Ring Subnetwork Graph
            </h3>
            <p className="text-xs text-gray-400">Cytoscape.js graph layout rendering account nodes and directed transaction edges</p>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            Nodes: {ring.graph.nodes.length} | Edges: {ring.graph.edges.length}
          </div>
        </div>

        <div className="h-[450px]">
          <CytoscapeGraph
            nodes={ring.graph.nodes}
            edges={ring.graph.edges}
            layoutName="cose"
          />
        </div>
      </div>
    </div>
  );
};
