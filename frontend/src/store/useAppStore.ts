import { create } from 'zustand';

interface AppState {
  selectedRingId: string;
  selectedNodeId: string | null;
  graphLayout: 'cose' | 'concentric' | 'circle' | 'grid';
  searchQuery: string;
  isSidebarOpen: boolean;
  selectedTab: string;
  setSelectedRingId: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setGraphLayout: (layout: 'cose' | 'concentric' | 'circle' | 'grid') => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSelectedTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRingId: 'RING-001', // Default target ring for instant demo
  selectedNodeId: 'ACC-10000',
  graphLayout: 'cose',
  searchQuery: '',
  isSidebarOpen: true,
  selectedTab: 'overview',
  setSelectedRingId: (id) => set({ selectedRingId: id }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setGraphLayout: (layout) => set({ graphLayout: layout }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
