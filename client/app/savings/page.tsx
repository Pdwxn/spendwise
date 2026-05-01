"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { SavingForm } from "@/components/savings/SavingForm";
import { SavingList } from "@/components/savings/SavingList";

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings"
        description="Track static savings and annual percentage projections."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SavingForm />
        <SavingList />
      </section>
    </div>
  );
}
