import { create } from 'zustand';
import { Widget, DashboardState } from '@/types/widget';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

interface DashboardStore extends DashboardState {
  addWidget: (widget: Omit<Widget, 'id' | 'lastUpdated' | 'error' | 'isLoading'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearAllWidgets: () => void;
  initialize: () => void;
}

const STORAGE_KEY = 'dashboard-storage';

const loadState = (): DashboardState => {
  if (typeof window === 'undefined') {
    return { widgets: [], theme: 'dark' };
  }
  return loadFromStorage<DashboardState>(STORAGE_KEY, { widgets: [], theme: 'dark' });
};

const saveState = (state: DashboardState) => {
  if (typeof window !== 'undefined') {
    saveToStorage(STORAGE_KEY, state);
  }
};

const useDashboardStore = create<DashboardStore>((set, get) => {
  // Always start with empty state to prevent hydration mismatches
  // The initialize() function will load the actual state after mount
  return {
    widgets: [],
    theme: 'dark',

    initialize: () => {
      const saved = loadState();
      set(saved);
    },

  addWidget: (widget) => {
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: undefined,
      error: undefined,
      isLoading: false,
    };
    set((state) => {
      const newState = { ...state, widgets: [...state.widgets, newWidget] };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },

  removeWidget: (id) => {
    set((state) => {
      const newState = { ...state, widgets: state.widgets.filter((w) => w.id !== id) };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },

  updateWidget: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },

  reorderWidgets: (widgets) => {
    set((state) => {
      const newState = { ...state, widgets };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },

  setTheme: (theme) => {
    set((state) => {
      const newState = { ...state, theme };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },

  clearAllWidgets: () => {
    set((state) => {
      const newState = { ...state, widgets: [] };
      saveState({ widgets: newState.widgets, theme: newState.theme });
      return newState;
    });
  },
  };
});

export default useDashboardStore;
