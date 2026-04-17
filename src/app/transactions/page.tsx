'use client';
import { Button, EmptyState, FormField, Modal, PageHeader } from '@/components/ui';
import { useFinance } from '@/hooks/useFinance';
import type { Transaction } from '@/types';
import { currentMonth, formatCurrency, formatMonth } from '@/utils/calculations';
import { Badge, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ── TransactionForm ──────────────────────────────────────────

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const { state } = useFinance();
  const [type,        setType]        = useState<'income' | 'expense'>('expense');
  const [amount,      setAmount]      = useState('');
  const [categoryId,  setCategoryId]  = useState(state.categories[0]?.id ?? '');
  const [accountId,   setAccountId]   = useState(state.accounts[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));

  function handleSubmit() {
    if (!amount || !categoryId || !accountId) return;
    onSubmit({ type, amount: Number(amount), categoryId, accountId, description, date });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Type toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1, padding: '0.55rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
              transition: 'all 0.15s',
              borderColor: type === t ? (t === 'expense' ? 'var(--color-expense)' : 'var(--color-income)') : 'var(--color-border)',
              background:   type === t ? (t === 'expense' ? '#f43f5e22' : '#10b98122') : 'var(--color-surface-2)',
              color:        type === t ? (t === 'expense' ? 'var(--color-expense)' : 'var(--color-income)') : 'var(--color-text-2)',
            }}
          >
            {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
          </button>
        ))}
      </div>

      <FormField label="Monto">
        <input
          className="input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormField label="Categoría">
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Cuenta">
          <select
            className="input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Fecha">
        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormField>

      <FormField label="Descripción (opcional)">
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade una nota…"
        />
      </FormField>

      {state.accounts.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-warning)', margin: 0 }}>
          ⚠️ Debes crear al menos una cuenta antes de registrar transacciones.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!amount || !categoryId || !accountId}
        >
          Registrar
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { state, dispatch, categoryById, accountById } = useFinance();
  const [month,      setMonth]      = useState(currentMonth());
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter,     setTypeFilter]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);

  const filtered = useMemo(() => {
    return [...state.transactions]
      .filter((t) => t.date.startsWith(month))
      .filter((t) => !categoryFilter || t.categoryId === categoryFilter)
      .filter((t) => !typeFilter || t.type === typeFilter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [state.transactions, month, categoryFilter, typeFilter]);

  function handleCreate(data: Omit<Transaction, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_TRANSACTION', payload: data });
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Transacciones"
        subtitle={`${filtered.length} transacci${filtered.length !== 1 ? 'ones' : 'ón'} este mes`}
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Nueva
          </Button>
        }
      />

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        alignItems: 'center', marginBottom: '1.5rem',
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setMonth((m) => addMonths(m, -1))}
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text)', minWidth: '110px', textAlign: 'center', textTransform: 'capitalize' }}>
            {formatMonth(month)}
          </span>
          <button onClick={() => setMonth((m) => addMonths(m, 1))}
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">Todas las categorías</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>

        <select
          className="input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '130px' }}
        >
          <option value="">Todos los tipos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>

        {(categoryFilter || typeFilter) && (
          <button
            onClick={() => { setCategoryFilter(''); setTypeFilter(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="Sin transacciones"
          description="No hay transacciones para este período o filtro."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Nueva transacción
            </Button>
          }
        />
      ) : (
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
              {filtered.map((tx, i) => {
                const cat     = categoryById(tx.categoryId);
                const account = accountById(tx.accountId);
                return (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
                      {tx.date}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {cat ? (
                        <Badge color={cat.color}>{cat.emoji} {cat.name}</Badge>
                      ) : (
                        <span style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>Sin categoría</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {account ? (
                        <Badge color={account.color}>{account.name}</Badge>
                      ) : '—'}
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
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tx.id)}
                        style={{ padding: '0.3rem', color: 'var(--color-text-3)' }}>
                        <Trash2 size={13} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva transacción" width={520}>
        <TransactionForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}