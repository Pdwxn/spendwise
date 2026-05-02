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
        <EmptyState title="Aún no hay cuentas" description="Crea una cuenta con el botón superior." />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const balance = getAccountBalance(account, transactions);

            return (
              <div key={account.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: account.color }} />
                    <p className="truncate text-sm font-medium text-cyan-50">{account.name}</p>
                  </div>
                  <p className="text-xs text-cyan-100/65">Creada {formatShortDate(account.createdAt)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-cyan-50">{formatCurrency(balance)}</p>
                  <p className="text-xs text-cyan-100/65">Inicial {formatCurrency(account.initialBalance)}</p>
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  className="w-full px-3 py-1.5 text-xs sm:w-auto"
                  onClick={() => handleRemoveAccount(account.id)}
                >
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
