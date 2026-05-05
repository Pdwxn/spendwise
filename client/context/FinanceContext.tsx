"use client";

import {
  createContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import {
  DEFAULT_CATEGORIES,
  SAVINGS_CATEGORY_ID,
  SYSTEM_CATEGORY_IDS,
} from "@/utils/constants";
import { canRemoveAccount, canRemoveCategory, canWithdrawFromSaving } from "@/utils/calculations";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type {
  Category,
  CreateAccountInput,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateSavingInput,
  CreateTransactionInput,
  FinanceState,
  ID,
  MonthKey,
  UpdateAccountInput,
  UpdateBudgetInput,
  UpdateCategoryInput,
  UpdateSavingInput,
  UpdateTransactionInput,
} from "@/types";

type FinanceActions = {
  addAccount: (input: CreateAccountInput) => Promise<void>;
  updateAccount: (id: ID, input: UpdateAccountInput) => Promise<void>;
  removeAccount: (id: ID) => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: ID, input: UpdateCategoryInput) => Promise<void>;
  removeCategory: (id: ID) => Promise<void>;
  addTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateTransaction: (id: ID, input: UpdateTransactionInput) => Promise<void>;
  removeTransaction: (id: ID) => Promise<void>;
  addBudget: (input: CreateBudgetInput) => Promise<void>;
  updateBudget: (id: ID, input: UpdateBudgetInput) => Promise<void>;
  removeBudget: (id: ID) => Promise<void>;
  addSaving: (input: CreateSavingInput) => Promise<void>;
  updateSaving: (id: ID, input: UpdateSavingInput) => Promise<void>;
  removeSaving: (id: ID) => Promise<void>;
  addSavingContribution: (input: {
    savingId: ID;
    accountId: ID;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
  addSavingWithdrawal: (input: {
    savingId: ID;
    accountId: ID;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
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
    savingContributions: [],
    savingWithdrawals: [],
    selectedMonth: getCurrentMonthKey(),
    selectedCategoryId: null,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRemoteState(value: unknown): FinanceState {
  const fallback = createInitialState();

  if (!isObject(value)) {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  const categories = Array.isArray(record.categories)
    ? record.categories
        .filter((category): category is Record<string, unknown> => isObject(category))
        .map((category) => ({
          id: String(category.id),
          name: String(category.name),
          emoji: String(category.emoji),
          color: String(category.color),
          createdAt: String(category.createdAt),
        }) as FinanceState["categories"][number])
    : fallback.categories;

  const categoryMap = new Map<string, Category>();

  for (const category of [...DEFAULT_CATEGORIES, ...categories]) {
    if (!categoryMap.has(category.id)) {
      categoryMap.set(category.id, category);
    }
  }

  const mergedCategories = Array.from(categoryMap.values());

  const accounts = Array.isArray(record.accounts)
    ? record.accounts
        .filter((account): account is Record<string, unknown> => isObject(account))
        .map((account) => ({
          id: String(account.id),
          name: String(account.name),
          initialBalance: toNumber(account.initialBalance),
          color: String(account.color),
          createdAt: String(account.createdAt),
        }) as FinanceState["accounts"][number])
    : fallback.accounts;

  const transactions = Array.isArray(record.transactions)
    ? record.transactions
        .filter((transaction): transaction is Record<string, unknown> => isObject(transaction))
        .map((transaction) => ({
          id: String(transaction.id),
          type: transaction.type === "income" ? "income" : "expense",
          amount: toNumber(transaction.amount),
          categoryId: String(transaction.categoryId),
          description: String(transaction.description),
          date: String(transaction.date),
          accountId: String(transaction.accountId),
          linkedSavingId: transaction.linkedSavingId ? String(transaction.linkedSavingId) : undefined,
          linkedSavingAction:
            transaction.linkedSavingAction === "contribution" || transaction.linkedSavingAction === "withdrawal"
              ? transaction.linkedSavingAction
              : undefined,
          createdAt: String(transaction.createdAt),
        }) as FinanceState["transactions"][number])
    : fallback.transactions;

  const budgets = Array.isArray(record.budgets)
    ? record.budgets
        .filter((budget): budget is Record<string, unknown> => isObject(budget))
        .map((budget) => ({
          id: String(budget.id),
          categoryId: String(budget.categoryId),
          month: String(budget.month) as MonthKey,
          amount: toNumber(budget.amount),
          createdAt: String(budget.createdAt),
        }) as FinanceState["budgets"][number])
    : fallback.budgets;

  const savings = Array.isArray(record.savings)
    ? record.savings
        .filter((saving): saving is Record<string, unknown> => isObject(saving))
        .map((saving) => ({
          id: String(saving.id),
          name: String(saving.name),
          initialAmount: toNumber(saving.initialAmount),
          mode: saving.mode === "annualPercentage" ? "annualPercentage" : "static",
          annualPercentage:
            saving.annualPercentage === null || saving.annualPercentage === undefined
              ? undefined
              : toNumber(saving.annualPercentage),
          createdAt: String(saving.createdAt),
        }) as FinanceState["savings"][number])
    : fallback.savings;

  const savingContributions = Array.isArray(record.savingContributions)
    ? record.savingContributions
        .filter((contribution): contribution is Record<string, unknown> => isObject(contribution))
        .map((contribution) => ({
          id: String(contribution.id),
          savingId: String(contribution.savingId),
          accountId: String(contribution.accountId),
          amount: toNumber(contribution.amount),
          description: String(contribution.description),
          date: String(contribution.date),
          createdAt: String(contribution.createdAt),
        }) as FinanceState["savingContributions"][number])
    : fallback.savingContributions;

  const savingWithdrawals = Array.isArray(record.savingWithdrawals)
    ? record.savingWithdrawals
        .filter((withdrawal): withdrawal is Record<string, unknown> => isObject(withdrawal))
        .map((withdrawal) => ({
          id: String(withdrawal.id),
          savingId: String(withdrawal.savingId),
          accountId: String(withdrawal.accountId),
          amount: toNumber(withdrawal.amount),
          description: String(withdrawal.description),
          date: String(withdrawal.date),
          createdAt: String(withdrawal.createdAt),
        }) as FinanceState["savingWithdrawals"][number])
    : fallback.savingWithdrawals;

  return {
    accounts,
    categories: mergedCategories.length > 0 ? mergedCategories : [...DEFAULT_CATEGORIES],
    transactions,
    budgets,
    savings,
    savingContributions,
    savingWithdrawals,
    selectedMonth:
      typeof record.selectedMonth === "string" && /^\d{4}-\d{2}$/.test(record.selectedMonth)
        ? (record.selectedMonth as MonthKey)
        : fallback.selectedMonth,
    selectedCategoryId:
      record.selectedCategoryId === null || typeof record.selectedCategoryId === "string"
        ? record.selectedCategoryId
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
  | {
      type: "add-saving-contribution";
      payload: {
        savingId: ID;
        accountId: ID;
        amount: number;
        description: string;
        date: string;
      };
    }
  | {
      type: "add-saving-withdrawal";
      payload: {
        savingId: ID;
        accountId: ID;
        amount: number;
        description: string;
        date: string;
      };
    }
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
      if (!canRemoveAccount(state, action.payload.id)) {
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
      if (SYSTEM_CATEGORY_IDS.includes(action.payload.id as (typeof SYSTEM_CATEGORY_IDS)[number])) {
        return state;
      }

      if (!canRemoveCategory(state, action.payload.id)) {
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
    case "add-saving-contribution": {
      const saving = state.savings.find((item) => item.id === action.payload.savingId);

      if (!saving || action.payload.amount <= 0) {
        return state;
      }

      const description = action.payload.description.trim() || `Abono a ${saving.name}`;

      return {
        ...state,
        savingContributions: [
          ...state.savingContributions,
          {
            id: createId(),
            createdAt: nowIso(),
            savingId: action.payload.savingId,
            accountId: action.payload.accountId,
            amount: action.payload.amount,
            description,
            date: action.payload.date,
          },
        ],
        transactions: [
          ...state.transactions,
          {
            id: createId(),
            createdAt: nowIso(),
            type: "expense",
            amount: action.payload.amount,
            categoryId: SAVINGS_CATEGORY_ID,
            description,
            date: action.payload.date,
            accountId: action.payload.accountId,
            linkedSavingId: saving.id,
            linkedSavingAction: "contribution",
          },
        ],
      };
    }
    case "add-saving-withdrawal": {
      const saving = state.savings.find((item) => item.id === action.payload.savingId);

      if (!saving || action.payload.amount <= 0 || !canWithdrawFromSaving(saving, state.savingContributions, state.savingWithdrawals, action.payload.amount)) {
        return state;
      }

      const description = action.payload.description.trim() || `Retiro de ${saving.name}`;

      return {
        ...state,
        savingWithdrawals: [
          ...state.savingWithdrawals,
          {
            id: createId(),
            createdAt: nowIso(),
            savingId: action.payload.savingId,
            accountId: action.payload.accountId,
            amount: action.payload.amount,
            description,
            date: action.payload.date,
          },
        ],
        transactions: [
          ...state.transactions,
          {
            id: createId(),
            createdAt: nowIso(),
            type: "income",
            amount: action.payload.amount,
            categoryId: SAVINGS_CATEGORY_ID,
            description,
            date: action.payload.date,
            accountId: action.payload.accountId,
            linkedSavingId: saving.id,
            linkedSavingAction: "withdrawal",
          },
        ],
      };
    }
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
  const { accessToken, isHydrated: isAuthHydrated, isAuthenticated, refreshSession } = useAuth();

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    if (!accessToken || !isAuthenticated) {
      dispatch({ type: "reset" });
      return;
    }

    let cancelled = false;

    async function loadState() {
      const params = new URLSearchParams();
      params.set("month", state.selectedMonth);

      if (state.selectedCategoryId) {
        params.set("categoryId", state.selectedCategoryId);
      }

      const nextState = await apiRequest(`/api/state/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!cancelled) {
        dispatch({ type: "hydrate", payload: normalizeRemoteState(nextState) });
      }
    }

    loadState().catch(() => {
      if (!cancelled) {
        dispatch({ type: "reset" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAuthHydrated, isAuthenticated]);

  async function request(path: string, init: RequestInit = {}, retry = true) {
    if (!accessToken) {
      throw new Error("No hay sesión activa.");
    }

    try {
      return await apiRequest(path, {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(init.headers ?? {}),
        },
      });
    } catch (error) {
      if (retry && error instanceof ApiError && error.status === 401) {
        const nextAccessToken = await refreshSession();

        if (nextAccessToken) {
          return apiRequest(path, {
            ...init,
            headers: {
              Authorization: `Bearer ${nextAccessToken}`,
              ...(init.headers ?? {}),
            },
          });
        }
      }

      throw error;
    }
  }

  async function refreshState() {
    if (!accessToken) {
      return;
    }

    const params = new URLSearchParams();
    params.set("month", state.selectedMonth);

    if (state.selectedCategoryId) {
      params.set("categoryId", state.selectedCategoryId);
    }

    const nextState = await request(`/api/state/?${params.toString()}`);
    dispatch({ type: "hydrate", payload: normalizeRemoteState(nextState) });
  }

  async function mutate<T>(operation: () => Promise<T>) {
    try {
      await operation();
      await refreshState();
    } catch (error) {
      await refreshState().catch(() => undefined);
      throw error;
    }
  }

  const actions: FinanceActions = {
    addAccount: (input) => mutate(() => request("/api/accounts/", { method: "POST", body: JSON.stringify(input) })),
    updateAccount: (id, input) => mutate(() => request(`/api/accounts/${id}/`, { method: "PATCH", body: JSON.stringify(input) })),
    removeAccount: (id) => mutate(() => request(`/api/accounts/${id}/`, { method: "DELETE" })),
    addCategory: (input) => mutate(() => request("/api/categories/", { method: "POST", body: JSON.stringify(input) })),
    updateCategory: (id, input) => mutate(() => request(`/api/categories/${id}/`, { method: "PATCH", body: JSON.stringify(input) })),
    removeCategory: (id) => mutate(() => request(`/api/categories/${id}/`, { method: "DELETE" })),
    addTransaction: (input) => mutate(() => request("/api/transactions/", { method: "POST", body: JSON.stringify(input) })),
    updateTransaction: (id, input) => mutate(() => request(`/api/transactions/${id}/`, { method: "PATCH", body: JSON.stringify(input) })),
    removeTransaction: (id) => mutate(() => request(`/api/transactions/${id}/`, { method: "DELETE" })),
    addBudget: (input) => mutate(() => request("/api/budgets/", { method: "POST", body: JSON.stringify(input) })),
    updateBudget: (id, input) => mutate(() => request(`/api/budgets/${id}/`, { method: "PATCH", body: JSON.stringify(input) })),
    removeBudget: (id) => mutate(() => request(`/api/budgets/${id}/`, { method: "DELETE" })),
    addSaving: (input) => mutate(() => request("/api/savings/", { method: "POST", body: JSON.stringify(input) })),
    updateSaving: (id, input) => mutate(() => request(`/api/savings/${id}/`, { method: "PATCH", body: JSON.stringify(input) })),
    removeSaving: (id) => mutate(() => request(`/api/savings/${id}/`, { method: "DELETE" })),
    addSavingContribution: (input) => mutate(() => request(`/api/savings/${input.savingId}/contributions/`, { method: "POST", body: JSON.stringify(input) })),
    addSavingWithdrawal: (input) => mutate(() => request(`/api/savings/${input.savingId}/withdrawals/`, { method: "POST", body: JSON.stringify(input) })),
    setSelectedMonth: (month) => dispatch({ type: "set-selected-month", payload: month }),
    setSelectedCategoryId: (categoryId) => dispatch({ type: "set-selected-category", payload: categoryId }),
    resetState: () => dispatch({ type: "reset" }),
  };

  return <FinanceContext.Provider value={{ state, actions }}>{children}</FinanceContext.Provider>;
}

export { FinanceContext };
