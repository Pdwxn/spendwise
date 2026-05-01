import { ProgressBar } from "@/components/ui/ProgressBar";
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
      <ProgressBar
        value={spentAmount}
        max={budgetAmount}
        label={`${formatCurrency(spentAmount)} / ${formatCurrency(budgetAmount)}`}
        indicatorClassName={barClassName}
      />
      <p className={`text-xs ${isOverBudget ? "text-rose-300" : "text-cyan-100/65"}`}>
        {Math.round(percentage)}% usado
      </p>
    </div>
  );
}
