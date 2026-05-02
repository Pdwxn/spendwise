"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
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

const CYAN = "#22d3ee";
const VIOLET = "#a78bfa";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixHexColors(left: string, right: string, weight: number) {
  const start = hexToRgb(left);
  const end = hexToRgb(right);
  const blend = (source: number, target: number) => Math.round(source * (1 - weight) + target * weight);

  return `#${[blend(start.r, end.r), blend(start.g, end.g), blend(start.b, end.b)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function getGradientId(categoryId: string) {
  return `category-gradient-${categoryId}`;
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: `${item.emoji} ${item.categoryName}`,
  }));

  return (
    <>
      {data.length === 0 ? (
        <EmptyState title="Sin datos por categoría" description="Añade gastos para ver el gráfico por categoría." />
      ) : (
        <div className="h-56 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <defs>
                {chartData.map((entry) => {
                  const gradientId = getGradientId(entry.categoryId);
                  const midColor = mixHexColors(entry.color, CYAN, 0.35);
                  const endColor = mixHexColors(entry.color, VIOLET, 0.28);

                  return (
                    <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.96} />
                      <stop offset="58%" stopColor={midColor} stopOpacity={0.94} />
                      <stop offset="100%" stopColor={endColor} stopOpacity={0.92} />
                    </linearGradient>
                  );
                })}
              </defs>
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
                  <Cell
                    key={entry.categoryId}
                    fill={entry.color}
                    stroke={`url(#${getGradientId(entry.categoryId)})`}
                    strokeWidth={3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
