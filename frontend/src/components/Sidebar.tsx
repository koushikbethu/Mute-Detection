import React from 'react';
import {
  LayoutDashboard, ShieldAlert, Network, Users, ArrowRightLeft,
  BarChart3, Cpu, Settings
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { selectedTab, setSelectedTab } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ring-details', label: 'Flagged Rings', icon: <ShieldAlert className="w-4 h-4" />, badge: '3 Active' },
    { id: 'graph-explorer', label: 'Graph Explorer', icon: <Network className="w-4 h-4" /> },
    { id: 'accounts', label: 'Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ml-insights', label: 'ML Insights', icon: <Cpu className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-gray-800 flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Fraud Monitoring
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-400' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-[#111827] border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400 font-medium">Model Status</span>
          <span className="text-emerald-400 font-semibold">XGBoost v1.4</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full w-[94%]" />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-2">
          <span>AUC: 99.8%</span>
          <span>F1: 87.3%</span>
        </div>
      </div>
    </aside>
  );
};
