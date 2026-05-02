"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { calculateBudgetProgress } from "@/utils/calculations";
import { formatCurrency, formatMonthLabel } from "@/utils/formatters";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";
import Link from "next/link";

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
        <EmptyState
          title="Aún no hay presupuestos"
          description="Crea un presupuesto para empezar a seguir el gasto por categoría."
          action={
            <Link
              href="#budget-form"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 hover:bg-white/[0.1]"
            >
              Crear presupuesto
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {currentBudgets.map((budget) => {
            const category = categories.find((item) => item.id === budget.categoryId);
            const progress = calculateBudgetProgress(budget, transactions, selectedMonth);

            return (
              <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-50">
                      {category?.emoji ?? "#"} {category?.name ?? "Desconocida"}
                    </p>
                    <p className="text-xs text-cyan-100/65">Presupuesto {formatCurrency(budget.amount)}</p>
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
