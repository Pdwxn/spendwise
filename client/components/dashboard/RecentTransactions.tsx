import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Transaction } from "@/types";

type RecentTransactionsProps = {
  transactions: Transaction[];
  categories: Category[];
  formatCurrency: (value: number) => string;
  formatShortDate: (value: string) => string;
};

export function RecentTransactions({
  transactions,
  categories,
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
        <EmptyState title="Aún no hay movimientos" description="Añade tu primer ingreso o gasto para llenar esta lista." />
      ) : (
        <ul className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);

            return (
              <li key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {category?.emoji ?? "#"} {transaction.description}
                  </p>
                  <p className="text-xs text-cyan-100/65">{formatShortDate(transaction.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${transaction.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
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
