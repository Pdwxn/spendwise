"use client";

import {
  createContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import {
  DEFAULT_CATEGORIES,
  STORAGE_KEY,
} from "@/utils/constants";
import { readStorageValue, writeStorageValue } from "@/utils/storage";
import type {
  Account,
  Budget,
  Category,
  CreateAccountInput,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateSavingInput,
  CreateTransactionInput,
  FinanceState,
  ID,
  MonthKey,
  Saving,
  Transaction,
  UpdateAccountInput,
  UpdateBudgetInput,
  UpdateCategoryInput,
  UpdateSavingInput,
  UpdateTransactionInput,
} from "@/types";

type FinanceActions = {
  addAccount: (input: CreateAccountInput) => void;
  updateAccount: (id: ID, input: UpdateAccountInput) => void;
  removeAccount: (id: ID) => void;
  addCategory: (input: CreateCategoryInput) => void;
  updateCategory: (id: ID, input: UpdateCategoryInput) => void;
  removeCategory: (id: ID) => void;
  addTransaction: (input: CreateTransactionInput) => void;
  updateTransaction: (id: ID, input: UpdateTransactionInput) => void;
  removeTransaction: (id: ID) => void;
  addBudget: (input: CreateBudgetInput) => void;
  updateBudget: (id: ID, input: UpdateBudgetInput) => void;
  removeBudget: (id: ID) => void;
  addSaving: (input: CreateSavingInput) => void;
  updateSaving: (id: ID, input: UpdateSavingInput) => void;
  removeSaving: (id: ID) => void;
  setSelectedMonth: (month: MonthKey) => void;
  setSelectedCategoryId: (categoryId: ID | null) => void;
  resetState: () => void;
};

type FinanceContextValue = {
  state: FinanceState;
  actions: FinanceActions;
};

type FinanceProviderProps = {
  children: ReactNode;
};

type FinanceStorageState = FinanceState;

const FinanceContext = createContext<FinanceContextValue | null>(null);

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getCurrentMonthKey(date = new Date()): MonthKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}` as MonthKey;
}

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createInitialState(): FinanceState {
  return {
    accounts: [],
    categories: [...DEFAULT_CATEGORIES],
    transactions: [],
    budgets: [],
    savings: [],
    selectedMonth: getCurrentMonthKey(),
    selectedCategoryId: null,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAccount(value: unknown): value is Account {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.initialBalance === "number"
    && typeof value.color === "string"
    && typeof value.createdAt === "string";
}

function isCategory(value: unknown): value is Category {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.emoji === "string"
    && typeof value.color === "string"
    && typeof value.createdAt === "string";
}

function isTransaction(value: unknown): value is Transaction {
  return isObject(value)
    && typeof value.id === "string"
    && (value.type === "income" || value.type === "expense")
    && typeof value.amount === "number"
    && typeof value.categoryId === "string"
    && typeof value.description === "string"
    && typeof value.date === "string"
    && typeof value.accountId === "string"
    && typeof value.createdAt === "string";
}

function isBudget(value: unknown): value is Budget {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.categoryId === "string"
    && typeof value.month === "string"
    && typeof value.amount === "number"
    && typeof value.createdAt === "string";
}

function isSaving(value: unknown): value is Saving {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.initialAmount === "number"
    && (value.mode === "static" || value.mode === "annualPercentage")
    && typeof value.createdAt === "string"
    && (value.annualPercentage === undefined || typeof value.annualPercentage === "number");
}

function normalizeState(value: unknown): FinanceState {
  const fallback = createInitialState();

  if (!isObject(value)) {
    return fallback;
  }

  const categories = Array.isArray(value.categories)
    ? value.categories.filter(isCategory)
    : fallback.categories;

  return {
    accounts: Array.isArray(value.accounts) ? value.accounts.filter(isAccount) : fallback.accounts,
    categories: categories.length > 0 ? categories : [...DEFAULT_CATEGORIES],
    transactions: Array.isArray(value.transactions) ? value.transactions.filter(isTransaction) : fallback.transactions,
    budgets: Array.isArray(value.budgets) ? value.budgets.filter(isBudget) : fallback.budgets,
    savings: Array.isArray(value.savings) ? value.savings.filter(isSaving) : fallback.savings,
    selectedMonth:
      typeof value.selectedMonth === "string"
        ? (value.selectedMonth as MonthKey)
        : fallback.selectedMonth,
    selectedCategoryId:
      value.selectedCategoryId === null || typeof value.selectedCategoryId === "string"
        ? value.selectedCategoryId
        : fallback.selectedCategoryId,
  };
}

type FinanceAction =
  | { type: "hydrate"; payload: FinanceState }
  | { type: "reset" }
  | { type: "add-account"; payload: CreateAccountInput }
  | { type: "update-account"; payload: { id: ID; input: UpdateAccountInput } }
  | { type: "remove-account"; payload: { id: ID } }
  | { type: "add-category"; payload: CreateCategoryInput }
  | { type: "update-category"; payload: { id: ID; input: UpdateCategoryInput } }
  | { type: "remove-category"; payload: { id: ID } }
  | { type: "add-transaction"; payload: CreateTransactionInput }
  | { type: "update-transaction"; payload: { id: ID; input: UpdateTransactionInput } }
  | { type: "remove-transaction"; payload: { id: ID } }
  | { type: "add-budget"; payload: CreateBudgetInput }
  | { type: "update-budget"; payload: { id: ID; input: UpdateBudgetInput } }
  | { type: "remove-budget"; payload: { id: ID } }
  | { type: "add-saving"; payload: CreateSavingInput }
  | { type: "update-saving"; payload: { id: ID; input: UpdateSavingInput } }
  | { type: "remove-saving"; payload: { id: ID } }
  | { type: "set-selected-month"; payload: MonthKey }
  | { type: "set-selected-category"; payload: ID | null };

function mergeUpdate<T extends { id: ID }>(items: T[], id: ID, input: Partial<Omit<T, "id" | "createdAt">>) {
  return items.map((item) => (item.id === id ? { ...item, ...input } : item));
}

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "reset":
      return createInitialState();
    case "add-account":
      return {
        ...state,
        accounts: [
          ...state.accounts,
          {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload,
          },
        ],
      };
    case "update-account":
      return {
        ...state,
        accounts: mergeUpdate(state.accounts, action.payload.id, action.payload.input),
      };
    case "remove-account":
      if (
        state.transactions.some(
          (transaction) => transaction.accountId === action.payload.id,
        )
      ) {
        return state;
      }

      return {
        ...state,
        accounts: state.accounts.filter((account) => account.id !== action.payload.id),
      };
    case "add-category":
      return {
        ...state,
        categories: [
          ...state.categories,
          {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload,
          },
        ],
      };
    case "update-category":
      return {
        ...state,
        categories: mergeUpdate(state.categories, action.payload.id, action.payload.input),
      };
    case "remove-category":
      if (
        state.transactions.some(
          (transaction) => transaction.categoryId === action.payload.id,
        ) ||
        state.budgets.some(
          (budget) => budget.categoryId === action.payload.id,
        )
      ) {
        return state;
      }

      return {
        ...state,
        categories: state.categories.filter((category) => category.id !== action.payload.id),
        selectedCategoryId:
          state.selectedCategoryId === action.payload.id ? null : state.selectedCategoryId,
      };
    case "add-transaction":
      return {
        ...state,
        transactions: [
          ...state.transactions,
          {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload,
          },
        ],
      };
    case "update-transaction":
      return {
        ...state,
        transactions: mergeUpdate(state.transactions, action.payload.id, action.payload.input),
      };
    case "remove-transaction":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload.id),
      };
    case "add-budget":
      return {
        ...state,
        budgets: [
          ...state.budgets,
          {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload,
          },
        ],
      };
    case "update-budget":
      return {
        ...state,
        budgets: mergeUpdate(state.budgets, action.payload.id, action.payload.input),
      };
    case "remove-budget":
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload.id),
      };
    case "add-saving":
      return {
        ...state,
        savings: [
          ...state.savings,
          {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload,
          },
        ],
      };
    case "update-saving":
      return {
        ...state,
        savings: mergeUpdate(state.savings, action.payload.id, action.payload.input),
      };
    case "remove-saving":
      return {
        ...state,
        savings: state.savings.filter((saving) => saving.id !== action.payload.id),
      };
    case "set-selected-month":
      return {
        ...state,
        selectedMonth: action.payload,
      };
    case "set-selected-category":
      return {
        ...state,
        selectedCategoryId: action.payload,
      };
    default:
      return state;
  }
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [state, dispatch] = useReducer(financeReducer, undefined, createInitialState);
  const [hasHydrated, setHasHydrated] = useReducer(() => true, false);

  useEffect(() => {
    const storedState = readStorageValue<FinanceStorageState>(STORAGE_KEY, createInitialState());
    dispatch({ type: "hydrate", payload: normalizeState(storedState) });
    setHasHydrated();
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    writeStorageValue(STORAGE_KEY, state);
  }, [hasHydrated, state]);

  const actions: FinanceActions = {
    addAccount: (input) => dispatch({ type: "add-account", payload: input }),
    updateAccount: (id, input) => dispatch({ type: "update-account", payload: { id, input } }),
    removeAccount: (id) => dispatch({ type: "remove-account", payload: { id } }),
    addCategory: (input) => dispatch({ type: "add-category", payload: input }),
    updateCategory: (id, input) => dispatch({ type: "update-category", payload: { id, input } }),
    removeCategory: (id) => dispatch({ type: "remove-category", payload: { id } }),
    addTransaction: (input) => dispatch({ type: "add-transaction", payload: input }),
    updateTransaction: (id, input) => dispatch({ type: "update-transaction", payload: { id, input } }),
    removeTransaction: (id) => dispatch({ type: "remove-transaction", payload: { id } }),
    addBudget: (input) => dispatch({ type: "add-budget", payload: input }),
    updateBudget: (id, input) => dispatch({ type: "update-budget", payload: { id, input } }),
    removeBudget: (id) => dispatch({ type: "remove-budget", payload: { id } }),
    addSaving: (input) => dispatch({ type: "add-saving", payload: input }),
    updateSaving: (id, input) => dispatch({ type: "update-saving", payload: { id, input } }),
    removeSaving: (id) => dispatch({ type: "remove-saving", payload: { id } }),
    setSelectedMonth: (month) => dispatch({ type: "set-selected-month", payload: month }),
    setSelectedCategoryId: (categoryId) => dispatch({ type: "set-selected-category", payload: categoryId }),
    resetState: () => dispatch({ type: "reset" }),
  };

  return <FinanceContext.Provider value={{ state, actions }}>{children}</FinanceContext.Provider>;
}

export { FinanceContext };
