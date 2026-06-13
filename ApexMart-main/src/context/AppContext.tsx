import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { DateRange } from '../types/database';

interface AppState {
  sidebarOpen: boolean;
  dateRange: DateRange;
  searchOpen: boolean;
}

type Action =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; open: boolean }
  | { type: 'SET_DATE_RANGE'; range: DateRange }
  | { type: 'SET_SEARCH_OPEN'; open: boolean };

const now = new Date();
const defaultRange: DateRange = {
  from: new Date(now.getFullYear(), now.getMonth() - 11, 1),
  to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR': return { ...state, sidebarOpen: action.open };
    case 'SET_DATE_RANGE': return { ...state, dateRange: action.range };
    case 'SET_SEARCH_OPEN': return { ...state, searchOpen: action.open };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setDateRange: (range: DateRange) => void;
  setSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    sidebarOpen: false,
    dateRange: defaultRange,
    searchOpen: false,
  });

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebar = useCallback((open: boolean) => dispatch({ type: 'SET_SIDEBAR', open }), []);
  const setDateRange = useCallback((range: DateRange) => dispatch({ type: 'SET_DATE_RANGE', range }), []);
  const setSearchOpen = useCallback((open: boolean) => dispatch({ type: 'SET_SEARCH_OPEN', open }), []);

  return (
    <AppContext.Provider value={{ state, toggleSidebar, setSidebar, setDateRange, setSearchOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
