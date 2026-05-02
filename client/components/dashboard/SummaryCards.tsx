import { Card } from "@/components/ui/Card";

type SummaryCardsProps = {
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpenses: string;
};

export function SummaryCards({ totalBalance, monthlyIncome, monthlyExpenses }: SummaryCardsProps) {
  return (
    <section className="space-y-3">
      <Card variant="highlight" className="p-4 sm:p-5">
        <p className="text-sm text-cyan-100/65">Saldo total</p>
        <p className="mt-2 break-words text-[clamp(1.75rem,6vw,2.5rem)] font-semibold tracking-tight text-cyan-50 sm:text-4xl">
          {totalBalance}
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card variant="subtle" className="p-3 sm:p-4">
          <p className="text-xs text-cyan-100/65 sm:text-sm">Ingresos del mes</p>
          <p className="mt-2 break-words text-lg font-semibold leading-tight text-emerald-300 sm:text-2xl">
            {monthlyIncome}
          </p>
        </Card>
        <Card variant="subtle" className="p-3 sm:p-4">
          <p className="text-xs text-cyan-100/65 sm:text-sm">Gastos del mes</p>
          <p className="mt-2 break-words text-lg font-semibold leading-tight text-rose-300 sm:text-2xl">
            {monthlyExpenses}
          </p>
        </Card>
      </div>
    </section>
  );
}
