"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import type { Transaction } from "@/types";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  const {
    state: { categories, savings },
  } = useFinance();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Movimientos</h2>
      </div>

      {transactions.length === 0 ? (
        <EmptyState title="No se encontraron movimientos" description="Prueba a ajustar los filtros." />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);
            const saving = transaction.linkedSavingId ? savings.find((item) => item.id === transaction.linkedSavingId) : null;
            const amountClassName = transaction.type === "expense" ? "text-rose-300" : "text-emerald-300";
            const isSavingMovement = transaction.linkedSavingAction !== undefined;
            const title = transaction.linkedSavingAction === "contribution"
              ? "Abono a ahorro"
              : transaction.linkedSavingAction === "withdrawal"
                ? "Retiro de ahorro"
                : `${category?.emoji ?? "#"} ${transaction.description}`;
            const subtitle = isSavingMovement
              ? `${saving?.name ?? "Ahorro"} · ${transaction.description}`
              : category?.name ?? "Desconocida";
            const amountSign = transaction.linkedSavingAction === "contribution"
              ? "-"
              : transaction.linkedSavingAction === "withdrawal"
                ? "+"
                : transaction.type === "expense"
                  ? "-"
                  : "+";

            return (
              <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  {isSavingMovement ? (
                    <span className="mb-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                      Ahorro
                    </span>
                  ) : null}
                  <p className="truncate text-sm font-medium text-cyan-50">
                    {title}
                  </p>
                  <p className="text-xs text-cyan-100/65">
                    {formatShortDate(transaction.date)} · {subtitle}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-sm font-semibold ${amountClassName}`}>
                    {amountSign}
                    {formatCurrency(transaction.amount)}
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
