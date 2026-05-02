import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Transaction } from "@/types";
import type { Saving } from "@/types";

type RecentTransactionsProps = {
  transactions: Transaction[];
  categories: Category[];
  savings?: Saving[];
  formatCurrency: (value: number) => string;
  formatShortDate: (value: string) => string;
};

export function RecentTransactions({
  transactions,
  categories,
  savings = [],
  formatCurrency,
  formatShortDate,
}: RecentTransactionsProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Movimientos recientes</h2>
        <p className="text-sm text-cyan-100/65">Actividad más reciente en la vista seleccionada.</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState title="Aún no hay movimientos" description="Añade tu primer ingreso o gasto desde el home." />
      ) : (
        <ul className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);
            const saving = transaction.linkedSavingId ? savings.find((item) => item.id === transaction.linkedSavingId) : null;
            const amountClassName = transaction.type === "expense" ? "text-rose-300" : "text-emerald-300";
            const title = saving ? transaction.description : `${category?.emoji ?? "#"} ${transaction.description}`;
            const subtitle = saving
              ? `${transaction.linkedSavingAction === "contribution" ? "Abono" : "Retiro"} · ${saving.name}`
              : category?.name ?? "Desconocida";

            return (
              <li key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cyan-50">
                    {title}
                  </p>
                  <p className="text-xs text-cyan-100/65">{formatShortDate(transaction.date)} · {subtitle}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${amountClassName}`}>
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-cyan-100/65">{category?.name ?? "Desconocida"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
