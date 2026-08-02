import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types';

try {
  cytoscape.use(coseBilkent);
} catch (e) {
  // Ignore re-registration warnings
}

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layoutName?: 'cose' | 'concentric' | 'circle' | 'grid';
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  layoutName = 'cose',
  onNodeClick,
  selectedNodeId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          risk_score: n.risk_score,
          color: n.color === 'red' ? '#EF4444' : n.color === 'orange' ? '#F97316' : n.color === 'yellow' ? '#F59E0B' : '#10B981',
          is_dormant: n.is_dormant,
          balance: n.balance
        }
      })),
      ...edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: `₹${e.amount.toLocaleString()}`,
          amount: e.amount
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'color': '#FFFFFF',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 46,
            'height': 46,
            'border-width': 3,
            'border-color': '#111827'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 5,
            'border-color': '#3B82F6',
            'width': 54,
            'height': 54
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#374151',
            'target-arrow-color': '#6B7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#9CA3AF',
            'text-rotation': 'autorotate',
            'text-background-color': '#111827',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px'
          }
        },
        {
          selector: 'edge[amount > 50000]',
          style: {
            'width': 4,
            'line-color': '#EF4444',
            'target-arrow-color': '#EF4444',
            'color': '#FCA5A5'
          }
        }
      ],
      layout: {
        name: layoutName === 'cose' ? 'cose-bilkent' : layoutName,
        animate: true,
        animationDuration: 500,
        padding: 50
      } as any
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) {
        onNodeClick(node.id());
      }
    });

    cy.on('zoom', () => {
      setZoomLevel(Math.round(cy.zoom() * 100));
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, layoutName]);

  useEffect(() => {
    if (cyRef.current && selectedNodeId) {
      cyRef.current.nodes().unselect();
      const selNode = cyRef.current.getElementById(selectedNodeId);
      if (selNode.length > 0) {
        selNode.select();
        cyRef.current.animate({
          center: { eles: selNode },
          zoom: 1.2
        }, { duration: 400 });
      }
    }
  }, [selectedNodeId]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
      setZoomLevel(Math.round(cyRef.current.zoom() * 100));
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      setZoomLevel(Math.round(cyRef.current.zoom() * 100));
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
      setZoomLevel(Math.round(cyRef.current.zoom() * 100));
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#0B0F17] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <div ref={containerRef} className="w-full h-full min-h-[500px]" />
      
      {/* Zoom / View controls overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 bg-[#111827]/90 backdrop-blur border border-gray-800 rounded-xl z-10 shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit View"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="px-2 border-l border-gray-800 text-[10px] font-mono text-gray-400 font-semibold">
          {zoomLevel}%
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 p-3.5 bg-[#111827]/90 backdrop-blur border border-gray-800 rounded-xl text-xs space-y-1.5 z-10 shadow-lg">
        <div className="font-bold text-gray-200 mb-1 flex items-center justify-between">
          <span>Graph Legend</span>
          <span className="text-[10px] text-gray-400 font-normal">Directed Edges</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-gray-400">Safe / Normal Account (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-gray-400">Moderate Risk (30-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
          <span className="text-gray-400">High Risk (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
          <span className="text-gray-400 font-semibold text-red-300">Confirmed Mule Ring (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};
