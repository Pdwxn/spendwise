"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseBars } from "@/components/dashboard/ExpenseBars";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ExpenseFormModal } from "@/components/transactions/ExpenseFormModal";
import { IncomeFormModal } from "@/components/transactions/IncomeFormModal";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/hooks/useFinance";
import {
  filterTransactions,
  getCategoryBreakdown,
  getMonthlyExpenses,
  getMonthlyIncome,
  getTotalBalance,
} from "@/utils/calculations";
import { formatCurrency, formatMonthLabel, formatShortDate } from "@/utils/formatters";

export default function DashboardPage() {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const {
    state: { accounts, budgets, categories, selectedCategoryId, selectedMonth, savings, transactions },
  } = useFinance();
  const { user } = useAuth();

  const filteredTransactions = filterTransactions(transactions, {
    month: selectedMonth,
    categoryId: selectedCategoryId,
  });
  const totalBalance = getTotalBalance(accounts, transactions);
  const monthlyIncome = getMonthlyIncome(filteredTransactions, selectedMonth);
  const monthlyExpenses = getMonthlyExpenses(filteredTransactions, selectedMonth);
  const categoryBreakdown = getCategoryBreakdown(filteredTransactions, categories, {
    month: selectedMonth,
    type: "expense",
  });
  const monthlyBudgets = budgets.filter((budget) => budget.month === selectedMonth);
  const budgetAmountByCategory = new Map(monthlyBudgets.map((budget) => [budget.categoryId, budget.amount] as const));
  const expenseBars = categoryBreakdown.slice(0, 5).map((item) => ({
    ...item,
    budgetAmount: budgetAmountByCategory.get(item.categoryId) ?? null,
  }));
  const recentTransactions = [...filteredTransactions]
    .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5);

  const displayName = user?.firstName ?? "Usuario";

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/50">Panel principal</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-cyan-50 sm:text-4xl">SpendWise</h1>
        </div>
        <p className="text-sm font-medium text-cyan-100/70">Bienvenido {displayName}</p>
        <p className="text-sm text-cyan-100/65">{formatMonthLabel(selectedMonth)}</p>
      </header>

      <SummaryCards
        totalBalance={formatCurrency(totalBalance)}
        monthlyIncome={formatCurrency(monthlyIncome)}
        monthlyExpenses={formatCurrency(monthlyExpenses)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsIncomeOpen(true)}>
          Nuevo ingreso
        </Button>
        <Button type="button" className="flex-1" onClick={() => setIsExpenseOpen(true)}>
          Nuevo gasto
        </Button>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-cyan-50">Gastos</h2>
        </div>

        <ExpenseBars items={expenseBars} />
      </section>

      <section>
        <RecentTransactions
          transactions={recentTransactions}
          categories={categories}
          savings={savings}
          formatCurrency={formatCurrency}
          formatShortDate={formatShortDate}
        />
      </section>

      <ExpenseFormModal open={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} />
      <IncomeFormModal open={isIncomeOpen} onClose={() => setIsIncomeOpen(false)} />
    </div>
  );
}
