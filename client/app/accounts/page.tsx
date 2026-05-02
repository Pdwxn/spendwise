"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AccountFormModal } from "@/components/accounts/AccountFormModal";
import { AccountList } from "@/components/accounts/AccountList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AccountsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas"
        description="Gestiona tus cuentas y revisa sus saldos al instante."
        action={
          <Button type="button" onClick={() => setIsOpen(true)}>
            Nueva cuenta
          </Button>
        }
      />

      <section>
        <AccountList />
      </section>

      <AccountFormModal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
