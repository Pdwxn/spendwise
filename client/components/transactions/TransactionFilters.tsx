"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import { getMonthKeyFromDate } from "@/utils/calculations";
import { formatMonthLabel } from "@/utils/formatters";
import type { Category, ID, MonthKey } from "@/types";

type TransactionFiltersProps = {
  categories: Category[];
};

function getRecentMonths(count: number): MonthKey[] {
  const months: MonthKey[] = [];
  const currentDate = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);
    months.push(getMonthKeyFromDate(date));
  }

  return months;
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const {
    state: { selectedCategoryId, selectedMonth },
    actions,
  } = useFinance();

  const monthOptions = getRecentMonths(12);

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Filtros</h2>
          <p className="text-sm text-slate-500">Filtra la lista por mes y categoría.</p>
        </div>
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            actions.setSelectedMonth(getMonthKeyFromDate(new Date()));
            actions.setSelectedCategoryId(null);
          }}
        >
          Restablecer
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={selectedMonth} onChange={(event) => actions.setSelectedMonth(event.target.value as MonthKey)}>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </Select>

        <Select
          value={selectedCategoryId ?? "all"}
          onChange={(event) => actions.setSelectedCategoryId(event.target.value === "all" ? null : (event.target.value as ID))}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
