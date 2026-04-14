export interface Category {
    id: string;
    name: string;
    emoji: string;
    color: string;         // hex, e.g. "#22c55e"
    createdAt: string;     // ISO datetime string
  }
  
  export interface Account {
    id: string;
    name: string;
    color: string;
    initialBalance: number;
    createdAt: string;
  }
  
  /**
   * amount is always positive — the `type` field determines
   * the sign in all calculations.
   */
  export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;        // always > 0
    categoryId: string;
    accountId: string;
    description: string;
    date: string;          // "YYYY-MM-DD"
    createdAt: string;     // ISO datetime — used for sorting
  }
  
  /**
   * month stored as "YYYY-MM", e.g. "2025-04"
   */
  export interface Budget {
    id: string;
    categoryId: string;
    month: string;
    limit: number;
    createdAt: string;
  }
  
  /**
   * Savings goal — discriminated by type:
   * - static:     fixed amount to set aside each month
   * - percentage: % of monthly income
   */
  export type SavingsType = 'static' | 'percentage';
  
  export interface SavingsGoal {
    id: string;
    name: string;
    type: SavingsType;
    value: number;         // static → amount in $; percentage → 0–100
    target?: number;       // optional total target amount
    accumulated: number;   // amount saved so far
    color: string;
    createdAt: string;
  }
  
  // ----------------------------------------------------------
  // GLOBAL STATE
  // ----------------------------------------------------------
  
  export interface FinanceState {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    savingsGoals: SavingsGoal[];
    version: number;       // for future schema migrations
  }
  
  // ----------------------------------------------------------
  // REDUCER ACTIONS — discriminated unions
  // ----------------------------------------------------------
  
  export type AccountAction =
    | { type: 'ADD_ACCOUNT';    payload: Omit<Account, 'id' | 'createdAt'> }
    | { type: 'EDIT_ACCOUNT';   payload: { id: string } & Partial<Omit<Account, 'id' | 'createdAt'>> }
    | { type: 'DELETE_ACCOUNT'; payload: string };
  
  export type CategoryAction =
    | { type: 'ADD_CATEGORY';    payload: Omit<Category, 'id' | 'createdAt'> }
    | { type: 'EDIT_CATEGORY';   payload: { id: string } & Partial<Omit<Category, 'id' | 'createdAt'>> }
    | { type: 'DELETE_CATEGORY'; payload: string };
  
  export type TransactionAction =
    | { type: 'ADD_TRANSACTION';    payload: Omit<Transaction, 'id' | 'createdAt'> }
    | { type: 'EDIT_TRANSACTION';   payload: { id: string } & Partial<Omit<Transaction, 'id' | 'createdAt'>> }
    | { type: 'DELETE_TRANSACTION'; payload: string };
  
  export type BudgetAction =
    | { type: 'ADD_BUDGET';    payload: Omit<Budget, 'id' | 'createdAt'> }
    | { type: 'EDIT_BUDGET';   payload: { id: string } & Partial<Omit<Budget, 'id' | 'createdAt'>> }
    | { type: 'DELETE_BUDGET'; payload: string };
  
  export type SavingsAction =
    | { type: 'ADD_SAVINGS_GOAL';    payload: Omit<SavingsGoal, 'id' | 'createdAt' | 'accumulated'> }
    | { type: 'EDIT_SAVINGS_GOAL';   payload: { id: string } & Partial<Omit<SavingsGoal, 'id' | 'createdAt'>> }
    | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
    | { type: 'CONTRIBUTE_SAVINGS';  payload: { id: string; amount: number } };
  
  export type SystemAction =
    | { type: 'LOAD_STATE';  payload: FinanceState }
    | { type: 'RESET_STATE' };
  
  export type Action =
    | AccountAction
    | CategoryAction
    | TransactionAction
    | BudgetAction
    | SavingsAction
    | SystemAction;
  
  // ----------------------------------------------------------
  // UI / UTILITY TYPES
  // ----------------------------------------------------------
  
  export interface DashboardFilters {
    month: string;             // "YYYY-MM"
    categoryId: string | null;
    accountId: string | null;
  }
  
  export interface BudgetSummary {
    budget: Budget;
    category: Category;
    spent: number;
    percentage: number;        // 0–200, capped for display
    exceeded: boolean;
  }
  
  export interface CategoryChartData {
    categoryId: string;
    name: string;
    emoji: string;
    color: string;
    total: number;
    type: 'income' | 'expense';
  }
  
  export interface MonthSummary {
    income: number;
    expenses: number;
    balance: number;
    expectedSavings: number;
  }