'use client';

import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';

import type {
  FinanceState,
  Action,
  Account,
  Category,
  Transaction,
} from '@/types';

// ----------------------------------------------------------
// DEFAULT STATE
// ----------------------------------------------------------

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentación',    emoji: '🍕', color: '#f97316', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Transporte',      emoji: '🚌', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Salud',           emoji: '💊', color: '#ec4899', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Entretenimiento', emoji: '🎬', color: '#a855f7', createdAt: new Date().toISOString() },
  { id: 'cat-5', name: 'Vivienda',        emoji: '🏠', color: '#14b8a6', createdAt: new Date().toISOString() },
  { id: 'cat-6', name: 'Ingresos',        emoji: '💼', color: '#22c55e', createdAt: new Date().toISOString() },
];

const INITIAL_STATE: FinanceState = {
  accounts: [],
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  budgets: [],
  savingsGoals: [],
  version: 1,
};

const STORAGE_KEY = 'spendwise_v1';

// ----------------------------------------------------------
// HELPERS
// ----------------------------------------------------------

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const now = () => new Date().toISOString();

// ----------------------------------------------------------
// REDUCER
// Pure function — no side effects. localStorage persistence
// is handled in a separate useEffect that observes state.
// ----------------------------------------------------------

function financeReducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {

    // ── ACCOUNTS ────────────────────────────────────────────
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, { ...action.payload, id: uid(), createdAt: now() }],
      };

    case 'EDIT_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };

    case 'DELETE_ACCOUNT':
      // Also removes all transactions linked to this account
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
        transactions: state.transactions.filter((t) => t.accountId !== action.payload),
      };

    // ── CATEGORIES ──────────────────────────────────────────
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: uid(), createdAt: now() }],
      };

    case 'EDIT_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case 'DELETE_CATEGORY':
      // Transactions keep their categoryId (shown as "Deleted category" in UI).
      // Budgets for this category are removed.
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        budgets: state.budgets.filter((b) => b.categoryId !== action.payload),
      };

    // ── TRANSACTIONS ─────────────────────────────────────────
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, { ...action.payload, id: uid(), createdAt: now() }],
      };

    case 'EDIT_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    // ── BUDGETS ──────────────────────────────────────────────
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, id: uid(), createdAt: now() }],
      };

    case 'EDIT_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
      };

    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
      };

    // ── SAVINGS GOALS ────────────────────────────────────────
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [
          ...state.savingsGoals,
          { ...action.payload, id: uid(), accumulated: 0, createdAt: now() },
        ],
      };

    case 'EDIT_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };

    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload),
      };

    case 'CONTRIBUTE_SAVINGS':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id
            ? { ...g, accumulated: g.accumulated + action.payload.amount }
            : g
        ),
      };

    // ── SYSTEM ───────────────────────────────────────────────
    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_STATE':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// ----------------------------------------------------------
// PERSISTENCE
// ----------------------------------------------------------

function loadFromStorage(): FinanceState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FinanceState;
    if (parsed.version !== INITIAL_STATE.version) {
      console.warn('[SpendWise] Storage schema mismatch — falling back to initial state');
      return null;
    }
    return parsed;
  } catch {
    console.error('[SpendWise] Failed to read localStorage — falling back to initial state');
    return null;
  }
}

function saveToStorage(state: FinanceState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[SpendWise] Failed to write to localStorage:', e);
  }
}

// ----------------------------------------------------------
// CONTEXT
// ----------------------------------------------------------

interface FinanceContextValue {
  state: FinanceState;
  dispatch: Dispatch<Action>;
  // Convenience selectors — memoized to avoid unnecessary re-renders
  accountById: (id: string) => Account | undefined;
  categoryById: (id: string) => Category | undefined;
  transactionsByAccount: (accountId: string) => Transaction[];
  transactionsByCategory: (categoryId: string) => Transaction[];
  transactionsByMonth: (month: string) => Transaction[];
}

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

// ----------------------------------------------------------
// PROVIDER
// ----------------------------------------------------------

interface FinanceProviderProps {
  children: ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  // Initialize with INITIAL_STATE (not from localStorage) to avoid
  // SSR/client hydration mismatch in Next.js. Storage is loaded
  // after first client-side mount via useEffect below.
  const [state, dispatch] = useReducer(financeReducer, INITIAL_STATE);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Persist on every state change
  useEffect(() => {
    const hasData =
      state.accounts.length > 0 ||
      state.transactions.length > 0 ||
      state.categories.some((c) => !DEFAULT_CATEGORIES.find((d) => d.id === c.id));

    if (hasData) {
      saveToStorage(state);
    }
  }, [state]);

  // ── Memoized selectors ───────────────────────────────────

  const accountById = useCallback(
    (id: string) => state.accounts.find((a) => a.id === id),
    [state.accounts]
  );

  const categoryById = useCallback(
    (id: string) => state.categories.find((c) => c.id === id),
    [state.categories]
  );

  const transactionsByAccount = useCallback(
    (accountId: string) => state.transactions.filter((t) => t.accountId === accountId),
    [state.transactions]
  );

  const transactionsByCategory = useCallback(
    (categoryId: string) => state.transactions.filter((t) => t.categoryId === categoryId),
    [state.transactions]
  );

  const transactionsByMonth = useCallback(
    (month: string) => state.transactions.filter((t) => t.date.startsWith(month)),
    [state.transactions]
  );

  const value: FinanceContextValue = {
    state,
    dispatch,
    accountById,
    categoryById,
    transactionsByAccount,
    transactionsByCategory,
    transactionsByMonth,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}