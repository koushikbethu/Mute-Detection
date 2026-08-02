import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp = true,
  accentColor = 'border-blue-500/30'
}) => {
  return (
    <div className={`p-5 bg-[#111827] border ${accentColor} rounded-2xl shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-[#1F2937] rounded-xl text-gray-300 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        {trend && (
          <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {trend}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
};
