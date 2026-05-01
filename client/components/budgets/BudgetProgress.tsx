import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/utils/formatters";

type BudgetProgressProps = {
  spentAmount: number;
  budgetAmount: number;
  percentage: number;
  isOverBudget: boolean;
};

export function BudgetProgress({ spentAmount, budgetAmount, percentage, isOverBudget }: BudgetProgressProps) {
  return (
    <div className="space-y-2">
      <ProgressBar value={spentAmount} max={budgetAmount} label={`${formatCurrency(spentAmount)} / ${formatCurrency(budgetAmount)}`} />
      <p className={`text-xs ${isOverBudget ? "text-rose-600" : "text-slate-500"}`}>
        {Math.round(percentage)}% used
      </p>
    </div>
  );
}
