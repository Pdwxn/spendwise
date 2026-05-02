"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { calculateSavingValue, getElapsedMonthsBetweenDates } from "@/utils/calculations";
import { formatCurrency, formatPercentage, formatShortDate } from "@/utils/formatters";
import Link from "next/link";

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
        <EmptyState
          title="Aún no hay ahorros"
          description="Crea un ahorro fijo o proyectado para seguir su evolución."
          action={
            <Link
              href="#saving-form"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 hover:bg-white/[0.1]"
            >
              Crear ahorro
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {savings.map((saving) => {
            const elapsedMonths = getElapsedMonthsBetweenDates(saving.createdAt);
            const currentValue = calculateSavingValue(saving, elapsedMonths);

            return (
              <div key={saving.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-50">{saving.name}</p>
                    <p className="text-xs text-cyan-100/65">Creado {formatShortDate(saving.createdAt)}</p>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    className="w-full px-3 py-1.5 text-xs sm:w-auto"
                    onClick={() => actions.removeSaving(saving.id)}
                  >
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
