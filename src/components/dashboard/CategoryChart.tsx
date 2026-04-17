'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, ResponsiveContainer,
} from 'recharts';
import type { CategoryChartData } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { EmptyState } from '@/components/ui';

interface CategoryChartProps {
  data: CategoryChartData[];
}

// Custom tick renders the category emoji on the X axis
function EmojiTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text
      x={x}
      y={(y ?? 0) + 16}
      textAnchor="middle"
      fontSize="18"
      dominantBaseline="middle"
    >
      {payload?.value}
    </text>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryChartData; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.65rem 1rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', marginBottom: '0.25rem' }}>
        {item.emoji} {item.name}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: item.color,
      }}>
        {formatCurrency(item.total)}
      </div>
    </div>
  );
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        emoji="📊"
        title="Sin datos"
        description="No hay transacciones este mes para mostrar en el gráfico."
      />
    );
  }

  // Sort descending by total
  const sorted = [...data].sort((a, b) => b.total - a.total);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={sorted}
        margin={{ top: 4, right: 8, left: 0, bottom: 8 }}
        barCategoryGap="28%"
      >
        <XAxis
          dataKey="emoji"
          tick={EmojiTick as React.ComponentType<unknown>}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'var(--color-surface-3)', radius: 4 }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {sorted.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}