"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SavingFormModal } from "@/components/savings/SavingFormModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { SavingList } from "@/components/savings/SavingList";

export default function SavingsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ahorros"
        description="Lleva ahorros fijos y proyecciones con rendimiento anual."
        action={
          <Button type="button" onClick={() => setIsOpen(true)}>
            Nuevo ahorro
          </Button>
        }
      />

      <section>
        <SavingList />
      </section>

      <SavingFormModal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
