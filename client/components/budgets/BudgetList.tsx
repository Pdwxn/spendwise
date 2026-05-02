"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { calculateBudgetProgress } from "@/utils/calculations";
import { formatCurrency, formatMonthLabel } from "@/utils/formatters";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";

export function BudgetList() {
  const {
    state: { budgets, categories, selectedMonth, transactions },
    actions,
  } = useFinance();

  const currentBudgets = budgets.filter((budget) => budget.month === selectedMonth);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Presupuestos mensuales</h2>
        <p className="text-sm text-cyan-100/65">Progreso de {formatMonthLabel(selectedMonth)}.</p>
      </div>

      {currentBudgets.length === 0 ? (
        <EmptyState title="Aún no hay presupuestos" description="Crea un presupuesto para empezar a seguir el gasto por categoría." />
      ) : (
        <div className="space-y-3">
          {currentBudgets.map((budget) => {
            const category = categories.find((item) => item.id === budget.categoryId);
            const progress = calculateBudgetProgress(budget, transactions, selectedMonth);

            return (
                <div key={budget.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-cyan-50">
                      {category?.emoji ?? "#"} {category?.name ?? "Desconocida"}
                    </p>
                    <p className="text-xs text-cyan-100/65">Presupuesto {formatCurrency(budget.amount)}</p>
                  </div>
                  <Button variant="secondary" type="button" onClick={() => actions.removeBudget(budget.id)}>
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
                    <p className="mt-2 text-xs text-cyan-100/65">Restante {formatCurrency(progress.remainingAmount)}</p>
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
