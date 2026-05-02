"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
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
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 12, fill: "rgba(236,254,255,0.7)" }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "rgba(236,254,255,0.7)" }} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Gasto"] as [string, string]}
                labelFormatter={(label) => `Categoría: ${String(label)}`}
                contentStyle={{
                  backgroundColor: "rgba(2, 6, 23, 0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#ecfeff",
                }}
                itemStyle={{ color: "#ecfeff" }}
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
