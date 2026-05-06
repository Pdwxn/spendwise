"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePreferences } from "@/context/PreferencesContext";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CategoryPieChartProps = {
  data: CategoryBreakdownItem[];
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { preferences } = usePreferences();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Distribución por categoría</h2>
      </div>

      {data.length === 0 ? (
        <EmptyState title="Sin datos" description="Esta vista se activará cuando existan gastos." />
      ) : (
        <div className="h-56 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="categoryName"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={4}
              >
                {data.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0), { currency: preferences.currency }), "Gasto"] as [string, string]}
                contentStyle={{
                  backgroundColor: "var(--surface-strong)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
