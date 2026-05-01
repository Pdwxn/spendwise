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
        <h2 className="text-lg font-semibold text-slate-950">Savings</h2>
        <p className="text-sm text-slate-500">Saved items with their estimated current value.</p>
      </div>

      {savings.length === 0 ? (
        <EmptyState title="No savings yet" description="Create a static or projected saving to track growth." />
      ) : (
        <div className="space-y-3">
          {savings.map((saving) => {
            const elapsedMonths = getElapsedMonthsBetweenDates(saving.createdAt);
            const currentValue = calculateSavingValue(saving, elapsedMonths);

            return (
              <div key={saving.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">{saving.name}</p>
                    <p className="text-xs text-slate-500">Created {formatShortDate(saving.createdAt)}</p>
                  </div>
                  <Button variant="secondary" type="button" onClick={() => actions.removeSaving(saving.id)}>
                    Delete
                  </Button>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-sm text-slate-500">Current value</p>
                  <p className="text-xl font-semibold text-slate-950">{formatCurrency(currentValue)}</p>
                  <p className="text-xs text-slate-500">
                    Mode: {saving.mode === "static" ? "Static" : `Annual ${formatPercentage(saving.annualPercentage ?? 0)}`}
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
