"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryBarChartProps = {
  data: CategoryBreakdownItem[];
};

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: `${item.emoji} ${item.categoryName}`,
  }));

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Gastos por categoría</h2>
        <p className="text-sm text-cyan-100/65">Gráfico de barras con emoji y color por categoría.</p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Sin datos por categoría"
          description="Añade gastos para ver el gráfico por categoría."
        />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 12, fill: "#475569" }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
              <Tooltip
                formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"] as [string, string]}
                labelFormatter={(label) => `Category: ${String(label)}`}
              />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
