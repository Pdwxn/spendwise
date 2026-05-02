"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import {
  getElapsedMonthsBetweenDates,
  getSavingContributionsTotal,
  getSavingCurrentValue,
  getSavingWithdrawalsTotal,
} from "@/utils/calculations";
import { formatCurrency, formatPercentage, formatShortDate } from "@/utils/formatters";
import { SavingContributionFormModal } from "@/components/savings/SavingContributionFormModal";
import { SavingWithdrawalFormModal } from "@/components/savings/SavingWithdrawalFormModal";
import type { ID } from "@/types";

export function SavingList() {
  const {
    state: { savings, savingContributions, savingWithdrawals },
  } = useFinance();
  const [activeSavingId, setActiveSavingId] = useState<ID | null>(null);
  const [activeMode, setActiveMode] = useState<"contribution" | "withdrawal" | null>(null);

  function openContribution(savingId: ID) {
    setActiveSavingId(savingId);
    setActiveMode("contribution");
  }

  function openWithdrawal(savingId: ID) {
    setActiveSavingId(savingId);
    setActiveMode("withdrawal");
  }

  function closeModals() {
    setActiveSavingId(null);
    setActiveMode(null);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Ahorros</h2>
      </div>

      {savings.length === 0 ? (
        <EmptyState title="Aún no hay ahorros" description="Crea un ahorro con el botón superior." />
      ) : (
        <div className="space-y-3">
          {savings.map((saving) => {
            const elapsedMonths = getElapsedMonthsBetweenDates(saving.createdAt);
            const currentValue = getSavingCurrentValue(saving, savingContributions, savingWithdrawals, elapsedMonths);
            const contributionsTotal = getSavingContributionsTotal(savingContributions, saving.id);
            const withdrawalsTotal = getSavingWithdrawalsTotal(savingWithdrawals, saving.id);

            return (
              <div key={saving.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-50">{saving.name}</p>
                    <p className="text-xs text-cyan-100/65">Creado {formatShortDate(saving.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:min-w-40">
                    <Button
                      type="button"
                      className="w-full px-3 py-1.5 text-xs sm:w-auto"
                      onClick={() => openContribution(saving.id)}
                    >
                      Abonar
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      className="w-full px-3 py-1.5 text-xs sm:w-auto"
                      onClick={() => openWithdrawal(saving.id)}
                    >
                      Agregar a cuenta
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-cyan-100/65">Valor actual</p>
                    <p className="text-xl font-semibold text-cyan-50">{formatCurrency(currentValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-cyan-100/65">Abonado</p>
                    <p className="text-lg font-semibold text-emerald-300">{formatCurrency(contributionsTotal)}</p>
                  </div>
                  {withdrawalsTotal > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm text-cyan-100/65">Retirado</p>
                      <p className="text-lg font-semibold text-rose-300">{formatCurrency(withdrawalsTotal)}</p>
                    </div>
                  ) : null}
                  <p className="sm:col-span-3 text-xs text-cyan-100/65">
                    Modo: {saving.mode === "static" ? "Fijo" : `Anual ${formatPercentage(saving.annualPercentage ?? 0)}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SavingContributionFormModal open={activeMode === "contribution"} savingId={activeSavingId} onClose={closeModals} />
      <SavingWithdrawalFormModal open={activeMode === "withdrawal"} savingId={activeSavingId} onClose={closeModals} />
    </Card>
  );
}
