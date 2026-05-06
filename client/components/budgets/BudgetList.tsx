"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { usePreferences } from "@/context/PreferencesContext";
import { calculateBudgetProgress } from "@/utils/calculations";
import { formatCurrency, formatMonthLabel } from "@/utils/formatters";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";

export function BudgetList() {
  const {
    state: { budgets, categories, selectedMonth, transactions },
    actions,
  } = useFinance();
  const { preferences } = usePreferences();

  const currentBudgets = budgets.filter((budget) => budget.month === selectedMonth);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Presupuestos mensuales</h2>
      </div>

      {currentBudgets.length === 0 ? (
        <EmptyState title="Aún no hay presupuestos" description="Crea un presupuesto con el botón superior." />
      ) : (
        <div className="space-y-3">
          {currentBudgets.map((budget) => {
            const category = categories.find((item) => item.id === budget.categoryId);
            const progress = calculateBudgetProgress(budget, transactions, selectedMonth);

            return (
              <div key={budget.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">
                      {category?.emoji ?? "#"} {category?.name ?? "Desconocida"}
                    </p>
                      <p className="text-xs text-[color:var(--foreground)]/65">Presupuesto {formatCurrency(budget.amount, { currency: preferences.currency })}</p>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    className="w-full px-3 py-1.5 text-xs sm:w-auto"
                    onClick={() => actions.removeBudget(budget.id)}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="mt-4">
                  <BudgetProgress
                    spentAmount={progress.spentAmount}
                    budgetAmount={progress.budgetAmount}
                    percentage={progress.percentage}
                    isOverBudget={progress.isOverBudget}
                  />
                  <p className="mt-2 text-xs text-[color:var(--foreground)]/65">Restante {formatCurrency(progress.remainingAmount, { currency: preferences.currency })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
