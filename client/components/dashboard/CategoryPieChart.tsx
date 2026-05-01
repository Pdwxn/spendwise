"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CategoryPieChartProps = {
  data: CategoryBreakdownItem[];
};

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Category mix</h2>
        <p className="text-sm text-slate-500">Proportion of category spending.</p>
      </div>

      {data.length === 0 ? (
        <EmptyState title="No chart data" description="This view will activate when expenses exist." />
      ) : (
        <div className="h-72 w-full">
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
              <Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"] as [string, string]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
