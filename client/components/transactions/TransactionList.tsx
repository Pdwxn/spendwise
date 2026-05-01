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
    state: { categories },
    actions,
  } = useFinance();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Movimientos</h2>
        <p className="text-sm text-cyan-100/65">Movimientos filtrados por mes y categoría.</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState title="No se encontraron movimientos" description="Prueba a ajustar los filtros o crea un movimiento nuevo." />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);

            return (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cyan-50">
                    {category?.emoji ?? "#"} {transaction.description}
                  </p>
                  <p className="text-xs text-cyan-100/65">{formatShortDate(transaction.date)} · {category?.name ?? "Desconocida"}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${transaction.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Button variant="secondary" type="button" onClick={() => actions.removeTransaction(transaction.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
