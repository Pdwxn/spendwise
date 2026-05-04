"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { canRemoveCategory } from "@/utils/calculations";
import { formatShortDate } from "@/utils/formatters";
import { isSystemCategoryId } from "@/utils/constants";

export function CategoryList() {
  const {
    state: { budgets, categories, transactions },
    actions,
  } = useFinance();
  const visibleCategories = categories.filter((category) => !isSystemCategoryId(category.id));

  async function handleRemoveCategory(categoryId: string) {
    if (!canRemoveCategory({ transactions, budgets }, categoryId)) {
      toast.info("No puedes eliminar una categoría con movimientos o presupuestos asociados.");
      return;
    }

    try {
      await actions.removeCategory(categoryId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría.");
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Categorías</h2>
      </div>

      {visibleCategories.length === 0 ? (
        <EmptyState title="Aún no hay categorías" description="Crea tu primera categoría con el botón superior." />
      ) : (
        <div className="space-y-3">
          {visibleCategories.map((category) => (
            <div key={category.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/categories/${category.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  <p className="truncate text-sm font-medium text-cyan-50">{category.name}</p>
                </div>
                <p className="text-xs text-cyan-100/65">Creada {formatShortDate(category.createdAt)}</p>
              </Link>
              <div className="h-4 w-4 self-start rounded-full sm:self-center" style={{ backgroundColor: category.color }} />
              <Button
                variant="secondary"
                type="button"
                className="w-full px-3 py-1.5 text-xs sm:w-auto"
                onClick={() => handleRemoveCategory(category.id)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
