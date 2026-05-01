import type {
  Account,
  Budget,
  Category,
  FinanceState,
  ID,
  MonthKey,
  Saving,
  Transaction,
  TransactionType,
} from "@/types";

export type CategoryBreakdownItem = {
  categoryId: ID;
  categoryName: string;
  emoji: string;
  color: string;
  amount: number;
  transactionCount: number;
};

export type BudgetProgress = {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isOverBudget: boolean;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function getMonthKeyFromDate(value: string | Date): MonthKey {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}$/.test(value)) {
      return value as MonthKey;
    }

    const monthMatch = value.match(/^(\d{4}-\d{2})-/);
    if (monthMatch) {
      return monthMatch[1] as MonthKey;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "1970-01";
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}` as MonthKey;
}

export function getElapsedMonthsBetweenDates(start: string | Date, end: string | Date = new Date()) {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  const yearsDiff = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  const monthsDiff = endDate.getUTCMonth() - startDate.getUTCMonth();
  return Math.max(0, yearsDiff * 12 + monthsDiff);
}

function isSameMonth(value: string | Date, month: MonthKey) {
  return getMonthKeyFromDate(value) === month;
}

function matchesCategory(transaction: Transaction, categoryId?: ID | null) {
  if (categoryId === undefined || categoryId === null) {
    return true;
  }

  return transaction.categoryId === categoryId;
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: MonthKey,
) {
  return transactions.filter((transaction) => isSameMonth(transaction.date, month));
}

export function filterTransactionsByCategory(
  transactions: Transaction[],
  categoryId?: ID | null,
) {
  return transactions.filter((transaction) => matchesCategory(transaction, categoryId));
}

export function filterTransactions(
  transactions: Transaction[],
  options: { month?: MonthKey; categoryId?: ID | null } = {},
) {
  return transactions.filter((transaction) => {
    const matchesMonth = options.month ? isSameMonth(transaction.date, options.month) : true;
    const matchesCategoryId = matchesCategory(transaction, options.categoryId);

    return matchesMonth && matchesCategoryId;
  });
}

function sumTransactionAmount(transactions: Transaction[], type: TransactionType) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getAccountBalance(account: Account, transactions: Transaction[]) {
  const accountTransactions = transactions.filter((transaction) => transaction.accountId === account.id);
  const income = sumTransactionAmount(accountTransactions, "income");
  const expenses = sumTransactionAmount(accountTransactions, "expense");

  return account.initialBalance + income - expenses;
}

export function getTotalBalance(accounts: Account[], transactions: Transaction[]) {
  const baseBalance = accounts.reduce((total, account) => total + account.initialBalance, 0);
  const income = sumTransactionAmount(transactions, "income");
  const expenses = sumTransactionAmount(transactions, "expense");

  return baseBalance + income - expenses;
}

export function getMonthlyIncome(transactions: Transaction[], month: MonthKey) {
  const monthlyTransactions = filterTransactionsByMonth(transactions, month);
  return sumTransactionAmount(monthlyTransactions, "income");
}

export function getMonthlyExpenses(transactions: Transaction[], month: MonthKey) {
  const monthlyTransactions = filterTransactionsByMonth(transactions, month);
  return sumTransactionAmount(monthlyTransactions, "expense");
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  options: { month?: MonthKey; type?: TransactionType } = {},
): CategoryBreakdownItem[] {
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesMonth = options.month ? isSameMonth(transaction.date, options.month) : true;
    const matchesType = options.type ? transaction.type === options.type : true;

    return matchesMonth && matchesType;
  });

  const totals = new Map<ID, CategoryBreakdownItem>();

  for (const transaction of filteredTransactions) {
    const category = categories.find((item) => item.id === transaction.categoryId);
    const existing = totals.get(transaction.categoryId);

    const nextItem: CategoryBreakdownItem = {
      categoryId: transaction.categoryId,
      categoryName: category?.name ?? "Unknown",
      emoji: category?.emoji ?? "❓",
      color: category?.color ?? "#94a3b8",
      amount: (existing?.amount ?? 0) + transaction.amount,
      transactionCount: (existing?.transactionCount ?? 0) + 1,
    };

    totals.set(transaction.categoryId, nextItem);
  }

  return Array.from(totals.values()).sort((left, right) => right.amount - left.amount);
}

export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  month: MonthKey = budget.month,
): BudgetProgress {
  const spentAmount = transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => transaction.categoryId === budget.categoryId)
    .filter((transaction) => isSameMonth(transaction.date, month))
    .reduce((total, transaction) => total + transaction.amount, 0);

  const remainingAmount = budget.amount - spentAmount;
  const percentage = budget.amount <= 0 ? 0 : (spentAmount / budget.amount) * 100;

  return {
    budgetAmount: budget.amount,
    spentAmount,
    remainingAmount,
    percentage,
    isOverBudget: spentAmount > budget.amount,
  };
}

export function calculateSavingValue(saving: Saving, elapsedMonths = 0) {
  if (saving.mode === "static") {
    return saving.initialAmount;
  }

  const months = Math.max(0, elapsedMonths);
  const annualPercentage = saving.annualPercentage ?? 0;
  const monthlyRate = annualPercentage / 100 / 12;

  return saving.initialAmount * Math.pow(1 + monthlyRate, months);
}

export function getBudgetProgressRatio(progress: BudgetProgress) {
  return Math.min(100, Math.max(0, progress.percentage));
}

export function canRemoveAccount(state: Pick<FinanceState, "transactions">, accountId: ID) {
  return !state.transactions.some((transaction) => transaction.accountId === accountId);
}

export function canRemoveCategory(
  state: Pick<FinanceState, "transactions" | "budgets">,
  categoryId: ID,
) {
  return !state.transactions.some((transaction) => transaction.categoryId === categoryId)
    && !state.budgets.some((budget) => budget.categoryId === categoryId);
}
