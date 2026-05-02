"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { calculateSavingValue, getElapsedMonthsBetweenDates } from "@/utils/calculations";
import { formatCurrency, formatPercentage, formatShortDate } from "@/utils/formatters";

export function SavingList() {
  const {
    state: { savings },
    actions,
  } = useFinance();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Ahorros</h2>
        <p className="text-sm text-cyan-100/65">Elementos guardados con su valor estimado actual.</p>
      </div>

      {savings.length === 0 ? (
        <EmptyState title="Aún no hay ahorros" description="Crea un ahorro fijo o proyectado para seguir su evolución." />
      ) : (
        <div className="space-y-3">
          {savings.map((saving) => {
            const elapsedMonths = getElapsedMonthsBetweenDates(saving.createdAt);
            const currentValue = calculateSavingValue(saving, elapsedMonths);

            return (
              <div key={saving.id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-cyan-50">{saving.name}</p>
                    <p className="text-xs text-cyan-100/65">Creado {formatShortDate(saving.createdAt)}</p>
                  </div>
                  <Button variant="secondary" type="button" onClick={() => actions.removeSaving(saving.id)}>
                    Eliminar
                  </Button>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-sm text-cyan-100/65">Valor actual</p>
                  <p className="text-xl font-semibold text-cyan-50">{formatCurrency(currentValue)}</p>
                  <p className="text-xs text-cyan-100/65">
                    Modo: {saving.mode === "static" ? "Fijo" : `Anual ${formatPercentage(saving.annualPercentage ?? 0)}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
