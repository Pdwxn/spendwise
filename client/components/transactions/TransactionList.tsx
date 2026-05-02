"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import type { Transaction } from "@/types";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import Link from "next/link";

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
        <EmptyState
          title="No se encontraron movimientos"
          description="Prueba a ajustar los filtros o crea un movimiento nuevo."
          action={
            <Link
              href="#transaction-form"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 hover:bg-white/[0.1]"
            >
              Crear movimiento
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);
            const amountClassName = transaction.type === "expense" ? "text-rose-300" : "text-emerald-300";

            return (
              <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cyan-50">
                    {category?.emoji ?? "#"} {transaction.description}
                  </p>
                  <p className="text-xs text-cyan-100/65">
                    {formatShortDate(transaction.date)} · {category?.name ?? "Desconocida"}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-sm font-semibold ${amountClassName}`}>
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Button
                    variant="secondary"
                    type="button"
                    className="w-full px-3 py-1.5 text-xs sm:w-auto"
                    onClick={() => actions.removeTransaction(transaction.id)}
                  >
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
