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
        <p className="text-sm text-cyan-100/65">Saldo total</p>
        <p className="mt-2 text-2xl font-semibold text-cyan-50">{totalBalance}</p>
      </Card>
      <Card>
        <p className="text-sm text-cyan-100/65">Ingresos del mes</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-300">{monthlyIncome}</p>
      </Card>
      <Card>
        <p className="text-sm text-cyan-100/65">Gastos del mes</p>
        <p className="mt-2 text-2xl font-semibold text-rose-300">{monthlyExpenses}</p>
      </Card>
    </section>
  );
}
