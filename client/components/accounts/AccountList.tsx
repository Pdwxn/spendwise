"use client";

import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { canRemoveAccount, getAccountBalance } from "@/utils/calculations";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

export function AccountList() {
  const {
    state: { accounts, transactions },
    actions,
  } = useFinance();

  function handleRemoveAccount(accountId: string) {
    if (!canRemoveAccount({ transactions }, accountId)) {
      toast.info("No puedes eliminar una cuenta con movimientos asociados.");
      return;
    }

    actions.removeAccount(accountId);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Cuentas</h2>
        <p className="text-sm text-cyan-100/65">Saldos actuales y datos de cada cuenta.</p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="Aún no hay cuentas" description="Crea una cuenta para empezar a registrar movimientos." />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const balance = getAccountBalance(account, transactions);

            return (
              <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} />
                    <p className="truncate text-sm font-medium text-cyan-50">{account.name}</p>
                  </div>
                  <p className="text-xs text-cyan-100/65">Creada {formatShortDate(account.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan-50">{formatCurrency(balance)}</p>
                  <p className="text-xs text-cyan-100/65">Inicial {formatCurrency(account.initialBalance)}</p>
                </div>
                <Button variant="secondary" type="button" onClick={() => handleRemoveAccount(account.id)}>
                  Eliminar
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
