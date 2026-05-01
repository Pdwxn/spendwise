import { Card } from "@/components/ui/Card";

type SummaryCardsProps = {
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpenses: string;
};

export function SummaryCards({ totalBalance, monthlyIncome, monthlyExpenses }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-slate-500">Saldo total</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{totalBalance}</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Ingresos del mes</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600">{monthlyIncome}</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Gastos del mes</p>
        <p className="mt-2 text-2xl font-semibold text-rose-600">{monthlyExpenses}</p>
      </Card>
    </section>
  );
}
