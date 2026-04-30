import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Home() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="SpendWise"
        description="Mobile-first personal finance workspace."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total balance</p>
          <p className="mt-2 text-2xl font-semibold">$0.00</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Income this month</p>
          <p className="mt-2 text-2xl font-semibold">$0.00</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Expenses this month</p>
          <p className="mt-2 text-2xl font-semibold">$0.00</p>
        </Card>
      </section>

      <EmptyState
        title="Workspace ready"
        description="The finance engine, storage, and domain screens will be added in the next tickets."
        action={<Button type="button">Start with categories</Button>}
      />
    </div>
  );
}
