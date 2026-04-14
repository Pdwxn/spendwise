import type {
    Transaction,
    Budget,
    Category,
    SavingsGoal,
    MonthSummary,
    BudgetSummary,
    CategoryChartData,
  } from '@/types';
  
  // ----------------------------------------------------------
  // BASIC AGGREGATIONS
  // ----------------------------------------------------------
  
  /** Sum of all income transactions */
  export function totalIncome(transactions: Transaction[]): number {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  /** Sum of all expense transactions */
  export function totalExpenses(transactions: Transaction[]): number {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  // ----------------------------------------------------------
  // MONTH SUMMARY
  // ----------------------------------------------------------
  
  /**
   * Calculates the full financial summary for a given month.
   * @param transactions - all transactions (unfiltered)
   * @param savingsGoals - all savings goals
   * @param month - "YYYY-MM"
   */
  export function calcMonthSummary(
    transactions: Transaction[],
    savingsGoals: SavingsGoal[],
    month: string
  ): MonthSummary {
    const monthTxs = transactions.filter((t) => t.date.startsWith(month));
    const income   = totalIncome(monthTxs);
    const expenses = totalExpenses(monthTxs);
  
    const expectedSavings = savingsGoals.reduce((sum, goal) => {
      if (goal.type === 'static')     return sum + goal.value;
      if (goal.type === 'percentage') return sum + (income * goal.value) / 100;
      return sum;
    }, 0);
  
    return {
      income,
      expenses,
      balance: income - expenses,
      expectedSavings,
    };
  }
  
  // ----------------------------------------------------------
  // ACCOUNT BALANCE
  // ----------------------------------------------------------
  
  /**
   * Current account balance = initialBalance + all linked transactions.
   * Income adds, expenses subtract.
   */
  export function calcAccountBalance(
    initialBalance: number,
    transactions: Transaction[]
  ): number {
    return transactions.reduce(
      (balance, t) => (t.type === 'income' ? balance + t.amount : balance - t.amount),
      initialBalance
    );
  }
  
  // ----------------------------------------------------------
  // CHART DATA
  // ----------------------------------------------------------
  
  /**
   * Groups transactions by category for the bar chart.
   * Returns one entry per category that has transactions,
   * including the category color and emoji for the X axis.
   */
  export function calcCategoryChartData(
    transactions: Transaction[],
    categories: Category[],
    type: 'expense' | 'income' = 'expense'
  ): CategoryChartData[] {
    const filtered = transactions.filter((t) => t.type === type);
  
    const totals = new Map<string, number>();
    for (const t of filtered) {
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
    }
  
    return Array.from(totals.entries())
      .map(([categoryId, total]) => {
        const cat = categories.find((c) => c.id === categoryId);
        if (!cat) return null;
        return { categoryId, name: cat.name, emoji: cat.emoji, color: cat.color, total, type };
      })
      .filter(Boolean) as CategoryChartData[];
  }
  
  // ----------------------------------------------------------
  // BUDGET STATUS
  // ----------------------------------------------------------
  
  /**
   * Calculates a budget's progress for a given month.
   * percentage is capped at 200 to keep the progress bar renderable
   * when the budget is heavily exceeded.
   */
  export function calcBudgetSummary(
    budget: Budget,
    category: Category,
    transactions: Transaction[]
  ): BudgetSummary {
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.categoryId === budget.categoryId &&
          t.date.startsWith(budget.month)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  
    const percentage = budget.limit > 0
      ? Math.min((spent / budget.limit) * 100, 200)
      : 0;
  
    return {
      budget,
      category,
      spent,
      percentage,
      exceeded: spent > budget.limit,
    };
  }
  
  // ----------------------------------------------------------
  // FORMATTING HELPERS
  // ----------------------------------------------------------
  
  /**
   * Formats a number as currency.
   * Defaults to Chilean Peso (CLP) with no decimal places.
   */
  export function formatCurrency(
    amount: number,
    locale = 'es-CL',
    currency = 'CLP'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  /** Returns the current month as "YYYY-MM" */
  export function currentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }
  
  /**
   * Converts "YYYY-MM" to a human-readable label.
   * e.g. "2025-04" → "abril 2025"
   */
  export function formatMonth(month: string): string {
    const [year, monthIndex] = month.split('-');
    const date = new Date(Number(year), Number(monthIndex) - 1, 1);
    return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  }