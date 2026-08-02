import React from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { useAppStore } from './store/useAppStore';

import { OverviewPage } from './pages/OverviewPage';
import { RingDetailsPage } from './pages/RingDetailsPage';
import { GraphExplorerPage } from './pages/GraphExplorerPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MLInsightsPage } from './pages/MLInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { selectedTab } = useAppStore();

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewPage />;
      case 'ring-details':
        return <RingDetailsPage />;
      case 'graph-explorer':
        return <GraphExplorerPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ml-insights':
        return <MLInsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
