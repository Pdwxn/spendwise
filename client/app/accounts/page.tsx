import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Create and review personal finance accounts."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <AccountForm />
        <AccountList />
      </section>
    </div>
  );
}
