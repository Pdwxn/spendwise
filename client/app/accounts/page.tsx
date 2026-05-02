import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas"
        description="Gestiona tus cuentas y revisa sus saldos al instante."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <AccountForm />
        <AccountList />
      </section>
    </div>
  );
}
