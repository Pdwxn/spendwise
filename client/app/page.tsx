"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
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
      <PageHeader
        title="SpendWise"
        description={`Current view: ${formatMonthLabel(selectedMonth)}${selectedCategoryId ? " · filtered by category" : ""}`}
      />

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
            <h2 className="text-lg font-semibold text-slate-950">Budget overview</h2>
            <p className="text-sm text-slate-500">Monthly progress by category.</p>
          </div>

          {budgetProgressItems.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              description="Create monthly budgets in the next ticket to see progress here."
            />
          ) : (
            <div className="space-y-4">
              {budgetProgressItems.map(({ budget, category, progress }) => (
                <div key={budget.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {category?.emoji ?? "#"} {category?.name ?? "Unknown"}
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
