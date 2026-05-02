"use client";

import { BudgetForm } from "@/components/budgets/BudgetForm";
import { BudgetList } from "@/components/budgets/BudgetList";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFinance } from "@/hooks/useFinance";
import { formatMonthLabel } from "@/utils/formatters";

export default function BudgetsPage() {
  const {
    state: { selectedMonth },
  } = useFinance();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description={`Presupuestos mensuales para ${formatMonthLabel(selectedMonth)}.`}
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <BudgetForm />
        <BudgetList />
      </section>
    </div>
  );
}
