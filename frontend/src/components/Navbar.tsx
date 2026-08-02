import React from 'react';
import { ShieldAlert, Activity, Search, Bell, UserCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <header className="h-16 bg-[#111827] border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg text-white shadow-md shadow-blue-900/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-wide">MuleDetect</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">v1.0 Enterprise</span>
          </div>
          <p className="text-xs text-gray-400">Graph Fraud Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Account ID (e.g. ACC-10000) or Ring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#1F2937] border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
          <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>Neo4j / Graph Engine Active</span>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white bg-[#1F2937] hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-sm">
            FA
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-gray-200">Senior Fraud Analyst</div>
            <div className="text-[10px] text-gray-400">Risk Intelligence Unit</div>
          </div>
        </div>
      </div>
    </header>
  );
};
