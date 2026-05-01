"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { formatShortDate } from "@/utils/formatters";

export function CategoryList() {
  const {
    state: { budgets, categories, transactions },
    actions,
  } = useFinance();

  function handleRemoveCategory(categoryId: string) {
    const hasTransactions = transactions.some((transaction) => transaction.categoryId === categoryId);
    const hasBudgets = budgets.some((budget) => budget.categoryId === categoryId);

    if (hasTransactions || hasBudgets) {
      toast.info("No puedes eliminar una categoría con transacciones o presupuestos asociados.");
      return;
    }

    actions.removeCategory(categoryId);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Categories</h2>
        <p className="text-sm text-slate-500">All available categories in the system.</p>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create your first category to start tracking spending." />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <Link href={`/categories/${category.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  <p className="truncate text-sm font-medium text-slate-950">{category.name}</p>
                </div>
                <p className="text-xs text-slate-500">Created {formatShortDate(category.createdAt)}</p>
              </Link>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
              <Button variant="secondary" type="button" onClick={() => handleRemoveCategory(category.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
