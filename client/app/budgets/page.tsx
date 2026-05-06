"use client";

import dynamic from "next/dynamic";
import { BudgetList } from "@/components/budgets/BudgetList";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFinance } from "@/hooks/useFinance";
import { formatMonthLabel } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const BudgetFormModal = dynamic(() => import("@/components/budgets/BudgetFormModal").then((module) => module.BudgetFormModal), {
  ssr: false,
});

export default function BudgetsPage() {
  const {
    state: { selectedMonth },
  } = useFinance();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description={`Presupuestos mensuales para ${formatMonthLabel(selectedMonth)}.`}
        action={
          <Button type="button" onClick={() => setIsOpen(true)}>
            Nuevo presupuesto
          </Button>
        }
      />

      <section>
        <BudgetList />
      </section>

      <BudgetFormModal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
