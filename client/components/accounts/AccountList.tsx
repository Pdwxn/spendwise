"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFinance } from "@/hooks/useFinance";
import { getAccountBalance } from "@/utils/calculations";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

export function AccountList() {
  const {
    state: { accounts, transactions },
    actions,
  } = useFinance();

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Accounts</h2>
        <p className="text-sm text-slate-500">Current balances and account metadata.</p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="No accounts yet" description="Create one account to start tracking transactions." />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const balance = getAccountBalance(account, transactions);

            return (
              <div key={account.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} />
                    <p className="truncate text-sm font-medium text-slate-950">{account.name}</p>
                  </div>
                  <p className="text-xs text-slate-500">Created {formatShortDate(account.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-950">{formatCurrency(balance)}</p>
                  <p className="text-xs text-slate-500">Initial {formatCurrency(account.initialBalance)}</p>
                </div>
                <Button variant="secondary" type="button" onClick={() => actions.removeAccount(account.id)}>
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
