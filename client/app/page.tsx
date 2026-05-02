"use client";

import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import Link from "next/link";
import {
  calculateBudgetProgress,
  filterTransactions,
  getCategoryBreakdown,
  getMonthlyExpenses,
  getMonthlyIncome,
  getTotalBalance,
} from "@/utils/calculations";
import { formatCurrency, formatMonthLabel, formatShortDate } from "@/utils/formatters";

export default function Home() {
  const {
    state: { accounts, budgets, categories, selectedCategoryId, selectedMonth, transactions },
  } = useFinance();

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
  const latestTransactions = [...filteredTransactions]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);
  const monthlyBudgets = budgets.filter((budget) => budget.month === selectedMonth);
  const budgetProgressItems = monthlyBudgets.map((budget) => ({
    budget,
    progress: calculateBudgetProgress(budget, transactions, selectedMonth),
    category: categories.find((item) => item.id === budget.categoryId),
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/50">Panel principal</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-cyan-50 sm:text-4xl">SpendWise</h1>
        </div>
        <p className="text-sm font-medium text-cyan-100/70">Bienvenido Usuario</p>
        <p className="text-sm text-cyan-100/65">
          Vista actual: {formatMonthLabel(selectedMonth)}{selectedCategoryId ? " · filtrado por categoría" : ""}
        </p>
      </header>

      <SummaryCards
        totalBalance={formatCurrency(totalBalance)}
        monthlyIncome={formatCurrency(monthlyIncome)}
        monthlyExpenses={formatCurrency(monthlyExpenses)}
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <CategoryBarChart data={categoryBreakdown} />
        <CategoryPieChart data={categoryBreakdown} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <RecentTransactions
          transactions={latestTransactions}
          categories={categories}
          formatCurrency={formatCurrency}
          formatShortDate={formatShortDate}
        />
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-cyan-50">Resumen de presupuestos</h2>
            <p className="text-sm text-cyan-100/65">Progreso mensual por categoría.</p>
          </div>

          {budgetProgressItems.length === 0 ? (
            <EmptyState
              title="Aún no hay presupuestos"
              description="Crea presupuestos mensuales para ver el progreso aquí."
              action={
                <Link
                  href="/budgets#budget-form"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 hover:bg-white/[0.1]"
                >
                  Crear presupuesto
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {budgetProgressItems.map(({ budget, category, progress }) => (
                <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-cyan-50">
                        {category?.emoji ?? "#"} {category?.name ?? "Desconocido"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <BudgetProgress
                      spentAmount={progress.spentAmount}
                      budgetAmount={progress.budgetAmount}
                      percentage={progress.percentage}
                      isOverBudget={progress.isOverBudget}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
