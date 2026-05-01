"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { canRemoveCategory } from "@/utils/calculations";
import { formatShortDate } from "@/utils/formatters";

export function CategoryList() {
  const {
    state: { budgets, categories, transactions },
    actions,
  } = useFinance();

  function handleRemoveCategory(categoryId: string) {
    if (!canRemoveCategory({ transactions, budgets }, categoryId)) {
      toast.info("No puedes eliminar una categoría con movimientos o presupuestos asociados.");
      return;
    }

    actions.removeCategory(categoryId);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Categorías</h2>
        <p className="text-sm text-cyan-100/65">Todas las categorías disponibles en el sistema.</p>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="Aún no hay categorías" description="Crea tu primera categoría para empezar a controlar gastos." />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <Link href={`/categories/${category.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                <p className="truncate text-sm font-medium text-cyan-50">{category.name}</p>
                </div>
                <p className="text-xs text-cyan-100/65">Creada {formatShortDate(category.createdAt)}</p>
              </Link>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
              <Button variant="secondary" type="button" onClick={() => handleRemoveCategory(category.id)}>
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
