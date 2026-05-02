"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryBreakdownItem } from "@/utils/calculations";
import { DEFAULT_LOCALE } from "@/utils/constants";

type ExpenseBarItem = CategoryBreakdownItem & {
  budgetAmount?: number | null;
};

type ExpenseBarsProps = {
  items: ExpenseBarItem[];
};

const MAX_BUDGET_SCALE = 1.4;

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

function formatCompactValue(value: number) {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ExpenseBars({ items }: ExpenseBarsProps) {
  if (items.length === 0) {
    return (
      <EmptyState title="Sin gastos" description="Añade movimientos para ver las barras aquí." />
    );
  }

  const maxSpent = Math.max(...items.map((item) => item.amount), 1);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const budgetAmount = item.budgetAmount ?? 0;
        const hasBudget = budgetAmount > 0;
        const visualScale = hasBudget ? budgetAmount * MAX_BUDGET_SCALE : maxSpent;
        const normalized = visualScale > 0 ? item.amount / visualScale : 0;
        const fillRatio = Math.max(0.18, Math.min(normalized, 1));
        const lineBottom = `${(1 / MAX_BUDGET_SCALE) * 100}%`;
        const glowColor = mixHexColors(item.color, "#22d3ee", 0.34);
        const glowColorTwo = mixHexColors(item.color, "#a78bfa", 0.26);
        const percentage = hasBudget
          ? Math.round((item.amount / budgetAmount) * 100)
          : Math.round((item.amount / maxSpent) * 100);

        return (
          <article
            key={item.categoryId}
            className="relative h-[330px] min-w-[126px] flex-1 overflow-hidden rounded-[32px] border bg-white/[0.03] p-3 backdrop-blur-2xl sm:min-w-[140px]"
            style={{
              borderColor: item.color,
              boxShadow: `0 0 0 1px ${item.color}30, 0 18px 50px rgba(0, 0, 0, 0.22), 0 0 24px ${glowColor}22`,
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

            <div
              className="absolute inset-x-2 bottom-3 rounded-[26px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.1)_46%,rgba(255,255,255,0.03)_100%)]"
              style={{ height: `calc(${fillRatio * 100}% - 0.75rem)` }}
            />

            {hasBudget ? (
              <div
                className="absolute left-3 right-3 z-10 border-t border-dashed border-white/55"
                style={{ bottom: lineBottom }}
              />
            ) : null}

            <div
              className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1 px-2 text-center"
              style={{ textShadow: `0 1px 0 ${glowColorTwo}` }}
            >
              <span className="text-[1.7rem] leading-none">{item.emoji}</span>
              <span className="whitespace-nowrap text-[12px] font-semibold leading-none text-cyan-50">
                {formatCompactValue(item.amount)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-100/70">
                {percentage}%
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
