'use client';
import { PageHeader, Button, Modal, FormField, EmptyState, ProgressBar } from '@/components/ui';
import { Plus, Pencil, Trash2, PlusCircle } from 'lucide-react';
import type { SavingsGoal } from '@/types';
import { useMemo, useState } from 'react';
import { currentMonth, formatCurrency, totalIncome } from '@/utils/calculations';
import { useFinance } from '@/hooks/useFinance';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
];

// ── SavingsGoalForm ──────────────────────────────────────────

interface GoalFormProps {
  initial?: Partial<SavingsGoal>;
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'accumulated'>) => void;
  onCancel: () => void;
}

function SavingsGoalForm({ initial, onSubmit, onCancel }: GoalFormProps) {
  const [name,   setName]   = useState(initial?.name   ?? '');
  const [type,   setType]   = useState<'static' | 'percentage'>(initial?.type ?? 'static');
  const [value,  setValue]  = useState(String(initial?.value  ?? ''));
  const [target, setTarget] = useState(String(initial?.target ?? ''));
  const [color,  setColor]  = useState(initial?.color  ?? PRESET_COLORS[0]);

  function handleSubmit() {
    if (!name.trim() || !value) return;
    onSubmit({
      name: name.trim(),
      type,
      value: Number(value),
      target: target ? Number(target) : undefined,
      color,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <FormField label="Nombre de la meta">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej. Fondo de emergencia, Viaje…"
        />
      </FormField>

      <FormField label="Tipo de ahorro">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['static', 'percentage'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1, padding: '0.55rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${type === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: type === t ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                color: type === t ? 'var(--color-accent)' : 'var(--color-text-2)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              {t === 'static' ? '$ Monto fijo' : '% Porcentaje'}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label={type === 'static' ? 'Monto mensual ($)' : 'Porcentaje de ingresos (%)'}>
        <input
          className="input"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === 'static' ? '50000' : '10'}
          min="0"
          max={type === 'percentage' ? '100' : undefined}
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </FormField>

      <FormField label="Objetivo total (opcional)">
        <input
          className="input"
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Monto total a alcanzar"
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
                width: '28px', height: '28px', borderRadius: '50%',
                background: c,
                border: color === c ? '3px solid var(--color-text)' : '3px solid transparent',
                cursor: 'pointer', transition: 'transform 0.1s',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </FormField>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {initial?.name ? 'Guardar cambios' : 'Crear meta'}
        </Button>
      </div>
    </div>
  );
}

// ── ContributeModal ──────────────────────────────────────────

interface ContributeProps {
  goal: SavingsGoal;
  onContribute: (amount: number) => void;
  onClose: () => void;
}

function ContributeModal({ goal, onContribute, onClose }: ContributeProps) {
  const [amount, setAmount] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
        Acumulado: <strong style={{ fontFamily: 'var(--font-mono)', color: goal.color }}>{formatCurrency(goal.accumulated)}</strong>
        {goal.target && ` / ${formatCurrency(goal.target)}`}
      </p>
      <FormField label="Monto a aportar">
        <input
          className="input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          style={{ fontFamily: 'var(--font-mono)' }}
          autoFocus
        />
      </FormField>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={() => { if (amount) { onContribute(Number(amount)); onClose(); } }}>
          Aportar
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function SavingsPage() {
  const { state, dispatch } = useFinance();
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<SavingsGoal | null>(null);
  const [contributing, setContributing] = useState<SavingsGoal | null>(null);

  // Monthly income (current month) for percentage-type display
  const monthlyIncome = useMemo(() => {
    const txs = state.transactions.filter((t) =>
      t.type === 'income' && t.date.startsWith(currentMonth())
    );
    return totalIncome(txs);
  }, [state.transactions]);

  function handleCreate(data: Omit<SavingsGoal, 'id' | 'createdAt' | 'accumulated'>) {
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: data });
    setModalOpen(false);
  }

  function handleEdit(data: Omit<SavingsGoal, 'id' | 'createdAt' | 'accumulated'>) {
    if (!editing) return;
    dispatch({ type: 'EDIT_SAVINGS_GOAL', payload: { id: editing.id, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta meta de ahorro?')) return;
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  }

  function handleContribute(id: string, amount: number) {
    dispatch({ type: 'CONTRIBUTE_SAVINGS', payload: { id, amount } });
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Ahorros"
        subtitle="Metas y fondos de ahorro"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Nueva meta
          </Button>
        }
      />

      {state.savingsGoals.length === 0 ? (
        <EmptyState
          emoji="🐷"
          title="Sin metas de ahorro"
          description="Crea una meta para empezar a ahorrar de forma sistemática."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Nueva meta
            </Button>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {state.savingsGoals.map((goal) => {
            const monthlyAmount = goal.type === 'static'
              ? goal.value
              : (monthlyIncome * goal.value) / 100;

            const targetPercent = goal.target && goal.target > 0
              ? Math.min((goal.accumulated / goal.target) * 100, 100)
              : null;

            return (
              <div key={goal.id} className="card" style={{ padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%', background: goal.color,
                      display: 'inline-block', marginRight: '0.5rem',
                    }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                      {goal.name}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: '0.25rem' }}>
                      {goal.type === 'static'
                        ? `${formatCurrency(goal.value)} / mes`
                        : `${goal.value}% de ingresos (≈ ${formatCurrency(monthlyAmount)} / mes)`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(goal)} style={{ padding: '0.3rem' }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}
                      style={{ padding: '0.3rem', color: 'var(--color-expense)' }}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                {/* Accumulated */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.6rem', fontWeight: 700,
                  color: goal.color, marginBottom: '0.5rem',
                }}>
                  {formatCurrency(goal.accumulated)}
                </div>

                {goal.target && (
                  <>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', marginBottom: '0.65rem' }}>
                      Meta: {formatCurrency(goal.target)}
                    </div>
                    <ProgressBar value={targetPercent ?? 0} color={goal.color} showLabel />
                  </>
                )}

                {/* Contribute button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setContributing(goal)}
                  style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
                >
                  <PlusCircle size={14} /> Registrar aporte
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva meta de ahorro">
        <SavingsGoalForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Edit */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar meta de ahorro">
        {editing && (
          <SavingsGoalForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Contribute */}
      <Modal open={!!contributing} onClose={() => setContributing(null)} title={`Aportar a "${contributing?.name}"`}>
        {contributing && (
          <ContributeModal
            goal={contributing}
            onContribute={(amount) => handleContribute(contributing.id, amount)}
            onClose={() => setContributing(null)}
          />
        )}
      </Modal>
    </div>
  );
}