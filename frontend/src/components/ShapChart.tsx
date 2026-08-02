import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ShapExplanation } from '../types';

interface ShapChartProps {
  explanations: ShapExplanation[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ explanations }) => {
  const data = explanations.map((e) => ({
    feature: e.feature.replace(/_/g, ' '),
    val: Math.abs(e.shap_value),
    rawVal: e.shap_value,
    impact: e.impact
  }));

  return (
    <div className="p-5 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
      <h4 className="text-sm font-bold text-gray-200 mb-1">SHAP Model Explainability</h4>
      <p className="text-xs text-gray-400 mb-4">Features contributing most heavily to XGBoost Fraud Risk Classification</p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <XAxis type="number" stroke="#6B7280" fontSize={11} />
            <YAxis type="category" dataKey="feature" stroke="#9CA3AF" fontSize={11} width={120} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }}
              formatter={(value: any, name: any, item: any) => [
                `${item.payload.rawVal > 0 ? '+' : ''}${item.payload.rawVal}`,
                'SHAP Impact'
              ]}
            />
            <Bar dataKey="val" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.impact === 'INCREASES_RISK' ? '#EF4444' : '#10B981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-400">Increases Fraud Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded" />
          <span className="text-gray-400">Decreases Fraud Risk</span>
        </div>
      </div>
    </div>
  );
};
