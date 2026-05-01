"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { filterTransactions } from "@/utils/calculations";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

type CategoryTransactionsProps = {
  categoryId: string;
};

export function CategoryTransactions({ categoryId }: CategoryTransactionsProps) {
  const {
    state: { categories, transactions },
  } = useFinance();

  const category = categories.find((item) => item.id === categoryId);
  const categoryTransactions = filterTransactions(transactions, { categoryId }).sort((left, right) => right.date.localeCompare(left.date));

  if (!category) {
      return (
        <EmptyState
        title="Categoría no encontrada"
        description="La categoría solicitada no existe o fue eliminada."
        action={<Link href="/categories" className="text-sm font-medium text-cyan-50 underline">Volver a categorías</Link>}
        />
      );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl">{category.emoji}</p>
          <h2 className="mt-2 text-lg font-semibold text-cyan-50">{category.name}</h2>
          <p className="text-sm text-cyan-100/65">Movimientos vinculados a esta categoría.</p>
        </div>
        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
      </div>

      {categoryTransactions.length === 0 ? (
        <EmptyState title="Sin movimientos" description="Todavía no hay movimientos asignados a esta categoría." />
      ) : (
        <div className="space-y-3">
          {categoryTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cyan-50">{transaction.description}</p>
                <p className="text-xs text-cyan-100/65">{formatShortDate(transaction.date)}</p>
              </div>
              <p className={`text-sm font-semibold ${transaction.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
