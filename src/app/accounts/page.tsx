'use client'
import { calcAccountBalance, formatCurrency } from '@/utils/calculations';
import { PageHeader, Button, Modal, FormField, EmptyState, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import type { Account } from '@/types';
import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
];

// ── AccountForm ──────────────────────────────────────────────

interface AccountFormProps {
  initial?: Partial<Account>;
  onSubmit: (data: Omit<Account, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const [name, setName]                   = useState(initial?.name ?? '');
  const [color, setColor]                 = useState(initial?.color ?? PRESET_COLORS[0]);
  const [initialBalance, setInitialBalance] = useState(String(initial?.initialBalance ?? 0));

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color, initialBalance: Number(initialBalance) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <FormField label="Nombre">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej. Banco Chile, Efectivo…"
        />
      </FormField>

      <FormField label="Saldo inicial">
        <input
          className="input"
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          placeholder="0"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </FormField>

      <FormField label="Color">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: c,
                border: color === c ? '3px solid var(--color-text)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'transform 0.1s',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </FormField>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {initial?.name ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </div>
    </div>
  );
}

// ── AccountCard ──────────────────────────────────────────────

interface AccountCardProps {
  account: Account;
  balance: number;
  onEdit: () => void;
  onDelete: () => void;
}

function AccountCard({ account, balance, onEdit, onDelete }: AccountCardProps) {
  return (
    <div className="card" style={{
      padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
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
        fontSize: '1.2rem',
        fontWeight: 600,
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

// ── Page ─────────────────────────────────────────────────────

export default function AccountsPage() {
  const { state, dispatch, transactionsByAccount } = useFinance();
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Account | null>(null);

  function handleCreate(data: Omit<Account, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_ACCOUNT', payload: data });
    setModalOpen(false);
  }

  function handleEdit(data: Omit<Account, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'EDIT_ACCOUNT', payload: { id: editing.id, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta cuenta y todas sus transacciones?')) return;
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  }

  const totalBalance = state.accounts.reduce((sum, acc) => {
    const txs = transactionsByAccount(acc.id);
    return sum + calcAccountBalance(acc.initialBalance, txs);
  }, 0);

  return (
    <div className="animate-in">
      <PageHeader
        title="Cuentas"
        subtitle={`${state.accounts.length} cuenta${state.accounts.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Nueva cuenta
          </Button>
        }
      />

      {state.accounts.length > 0 && (
        <div className="card" style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
            Balance total
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.5rem', fontWeight: 700,
            color: totalBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
          }}>
            {formatCurrency(totalBalance)}
          </span>
        </div>
      )}

      {state.accounts.length === 0 ? (
        <EmptyState
          emoji="💳"
          title="Sin cuentas"
          description="Crea tu primera cuenta para empezar a registrar tus finanzas."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Nueva cuenta
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {state.accounts.map((acc) => {
            const txs = transactionsByAccount(acc.id);
            const balance = calcAccountBalance(acc.initialBalance, txs);
            return (
              <AccountCard
                key={acc.id}
                account={acc}
                balance={balance}
                onEdit={() => setEditing(acc)}
                onDelete={() => handleDelete(acc.id)}
              />
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva cuenta">
        <AccountForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar cuenta">
        {editing && (
          <AccountForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}