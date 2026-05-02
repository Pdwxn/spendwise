"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CategoryPieChartProps = {
  data: CategoryBreakdownItem[];
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Distribución por categoría</h2>
        <p className="text-sm text-cyan-100/65">Proporción del gasto por categoría.</p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="Esta vista se activará cuando existan gastos."
          action={
            <Link
              href="/transactions#transaction-form"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 hover:bg-white/[0.1]"
            >
              Crear gasto
            </Link>
          }
        />
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
                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Gasto"] as [string, string]}
                contentStyle={{
                  backgroundColor: "rgba(2, 6, 23, 0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#ecfeff",
                }}
                itemStyle={{ color: "#ecfeff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
