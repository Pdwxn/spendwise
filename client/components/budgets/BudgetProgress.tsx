import { formatCurrency } from "@/utils/formatters";

type BudgetProgressProps = {
  spentAmount: number;
  budgetAmount: number;
  percentage: number;
  isOverBudget: boolean;
};

export function BudgetProgress({ spentAmount, budgetAmount, percentage, isOverBudget }: BudgetProgressProps) {
  const barClassName = isOverBudget
    ? "bg-rose-500"
    : percentage >= 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-[width] ${barClassName}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
      <p className={`text-xs ${isOverBudget ? "text-rose-600" : "text-slate-500"}`}>
        {Math.round(percentage)}% used
      </p>
    </div>
  );
}
