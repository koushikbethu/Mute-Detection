import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, Clock, Landmark } from 'lucide-react';

interface RingFlowChartProps {
  flowSequence: string[];
  totalAmount: number;
  hopCount: number;
}

export const RingFlowChart: React.FC<RingFlowChartProps> = ({
  flowSequence,
  totalAmount,
  hopCount
}) => {
  return (
    <div className="p-6 bg-[#111827] border border-red-500/30 rounded-2xl shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
              FLAGGED MULE RING
            </span>
            <span className="text-xs text-gray-400">Total Hops: {hopCount}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Multi-Hop Money Flow Pipeline</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Laundered Volume</div>
          <div className="text-xl font-extrabold text-red-400">₹{totalAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto py-4 px-2">
        {flowSequence.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === flowSequence.length - 1;

          return (
            <React.Fragment key={idx}>
              <div className={`flex flex-col items-center p-4 rounded-xl border min-w-[150px] transition-all ${
                isFirst
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                  : isLast
                  ? 'bg-red-500/10 border-red-500/40 text-red-300 shadow-md shadow-red-500/10'
                  : 'bg-[#1F2937] border-gray-700 text-gray-200'
              }`}>
                <div className="p-2.5 rounded-lg mb-2 bg-[#111827]">
                  {isFirst ? (
                    <Clock className="w-5 h-5 text-amber-400" />
                  ) : isLast ? (
                    <Landmark className="w-5 h-5 text-red-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                
                <span className="text-xs font-bold text-center tracking-wide">{step}</span>
                
                <span className="text-[10px] mt-1 text-gray-400 font-medium">
                  {isFirst ? 'Entry Credit (+180d Dormant)' : isLast ? 'Exit Cash Out' : `Intermediate Hop ${idx}`}
                </span>
              </div>

              {!isLast && (
                <div className="flex flex-col items-center justify-center my-2 md:my-0">
                  <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold mt-1">95% Rapid Forward</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
