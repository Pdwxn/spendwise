'use client'
import { formatCurrency, currentMonth, formatMonth, calcBudgetSummary } from '@/utils/calculations';
import { PageHeader, Button, Modal, FormField, EmptyState, ProgressBar } from '@/components/ui';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Budget } from '@/types';
import { useFinance } from '@/hooks/useFinance';
import { useMemo, useState } from 'react';

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ── BudgetForm ───────────────────────────────────────────────

interface BudgetFormProps {
  month: string;
  initial?: Partial<Budget>;
  onSubmit: (data: Omit<Budget, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function BudgetForm({ month, initial, onSubmit, onCancel }: BudgetFormProps) {
  const { state } = useFinance();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? state.categories[0]?.id ?? '');
  const [limit,      setLimit]      = useState(String(initial?.limit ?? ''));

  function handleSubmit() {
    if (!categoryId || !limit) return;
    onSubmit({ categoryId, month, limit: Number(limit) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <FormField label="Categoría">
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={!!initial?.categoryId}
        >
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label={`Límite para ${formatMonth(month)}`}>
        <input
          className="input"
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </FormField>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {initial?.limit !== undefined ? 'Guardar cambios' : 'Crear presupuesto'}
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function BudgetsPage() {
  const { state, dispatch } = useFinance();
  const [month,      setMonth]      = useState(currentMonth());
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Budget | null>(null);

  const monthBudgets = useMemo(
    () => state.budgets.filter((b) => b.month === month),
    [state.budgets, month]
  );

  const summaries = useMemo(() => {
    return monthBudgets
      .map((b) => {
        const category = state.categories.find((c) => c.id === b.categoryId);
        if (!category) return null;
        return calcBudgetSummary(b, category, state.transactions);
      })
      .filter(Boolean) as ReturnType<typeof calcBudgetSummary>[];
  }, [monthBudgets, state.categories, state.transactions]);

  function handleCreate(data: Omit<Budget, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_BUDGET', payload: data });
    setModalOpen(false);
  }

  function handleEdit(data: Omit<Budget, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'EDIT_BUDGET', payload: { id: editing.id, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Presupuestos"
        subtitle="Control mensual de gastos por categoría"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Nuevo presupuesto
          </Button>
        }
      />

      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button onClick={() => setMonth((m) => addMonths(m, -1))}
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text)', minWidth: '120px', textAlign: 'center', textTransform: 'capitalize' }}>
          {formatMonth(month)}
        </span>
        <button onClick={() => setMonth((m) => addMonths(m, 1))}
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="Sin presupuestos"
          description={`No hay presupuestos para ${formatMonth(month)}. Crea uno para controlar tus gastos.`}
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Nuevo presupuesto
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {summaries.map(({ budget, category, spent, percentage, exceeded }) => (
            <div key={budget.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: `${category.color}22`,
                  border: `1px solid ${category.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {category.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                      {category.name}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {exceeded && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                          SUPERADO
                        </span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setEditing(budget)} style={{ padding: '0.3rem' }}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}
                        style={{ padding: '0.3rem', color: 'var(--color-expense)' }}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: exceeded ? 'var(--color-warning)' : 'var(--color-text)' }}>
                        {formatCurrency(spent)}
                      </span>
                      {' '}/ {formatCurrency(budget.limit)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: exceeded ? 'var(--color-warning)' : 'var(--color-text-3)' }}>
                      {formatCurrency(budget.limit - spent)} {exceeded ? 'excedido' : 'restante'}
                    </span>
                  </div>
                </div>
              </div>

              <ProgressBar
                value={percentage}
                color={category.color}
                exceeded={exceeded}
                showLabel
              />
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo presupuesto">
        <BudgetForm month={month} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar presupuesto">
        {editing && (
          <BudgetForm
            month={month}
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}