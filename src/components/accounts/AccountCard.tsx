'use client';

import { formatCurrency } from '@/utils/calculations';
import { Button } from '@/components/ui';
import { Wallet, Pencil, Trash2 } from 'lucide-react';
import type { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  balance: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function AccountCard({ account, balance, onEdit, onDelete }: AccountCardProps) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '42px', height: '42px',
        borderRadius: 'var(--radius-md)',
        background: `${account.color}22`,
        border: `1px solid ${account.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Wallet size={18} color={account.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
          {account.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: '2px' }}>
          Saldo inicial: {formatCurrency(account.initialBalance)}
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.2rem', fontWeight: 600,
        color: balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
        minWidth: 'max-content',
      }}>
        {formatCurrency(balance)}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <Button variant="ghost" size="sm" onClick={onEdit} style={{ padding: '0.4rem' }}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}
          style={{ padding: '0.4rem', color: 'var(--color-expense)' }}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}