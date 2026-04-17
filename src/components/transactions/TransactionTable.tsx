'use client';

import { useFinance } from '@/hooks/useFinance';
import { formatCurrency } from '@/utils/calculations';
import { Button, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { Transaction } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function TransactionTable({ transactions, onDelete, onNew }: TransactionTableProps) {
  const { categoryById, accountById } = useFinance();

  if (transactions.length === 0) {
    return (
      <EmptyState
        emoji="📝"
        title="Sin transacciones"
        description="No hay transacciones para este período o filtro."
        action={
          <Button variant="primary" onClick={onNew}>
            <Plus size={15} /> Nueva transacción
          </Button>
        }
      />
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Fecha', 'Categoría', 'Descripción', 'Cuenta', 'Monto', ''].map((h) => (
              <th key={h} style={{
                padding: '0.75rem 1.25rem',
                textAlign: h === 'Monto' ? 'right' : 'left',
                fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--color-text-3)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => {
            const cat     = categoryById(tx.categoryId);
            const account = accountById(tx.accountId);
            return (
              <tr
                key={tx.id}
                style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
                  {tx.date}
                </td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  {cat
                    ? <Badge color={cat.color}>{cat.emoji} {cat.name}</Badge>
                    : <span style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>Sin categoría</span>
                  }
                </td>
                <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.description || '—'}
                </td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  {account
                    ? <Badge color={account.color}>{account.name}</Badge>
                    : '—'
                  }
                </td>
                <td style={{
                  padding: '0.85rem 1.25rem', textAlign: 'right',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600,
                  color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(tx.id)}
                    style={{ padding: '0.3rem', color: 'var(--color-text-3)' }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}