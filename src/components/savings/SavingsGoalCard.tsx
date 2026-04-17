'use client';

import { formatCurrency } from '@/utils/calculations';
import { Button, ProgressBar } from '@/components/ui';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import type { SavingsGoal } from '@/types';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  monthlyIncome: number;
  onEdit: () => void;
  onDelete: () => void;
  onContribute: () => void;
}

export function SavingsGoalCard({
  goal,
  monthlyIncome,
  onEdit,
  onDelete,
  onContribute,
}: SavingsGoalCardProps) {
  const monthlyAmount =
    goal.type === 'static'
      ? goal.value
      : (monthlyIncome * goal.value) / 100;

  const targetPercent =
    goal.target && goal.target > 0
      ? Math.min((goal.accumulated / goal.target) * 100, 100)
      : null;

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
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
          <Button variant="ghost" size="sm" onClick={onEdit} style={{ padding: '0.3rem' }}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}
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

      <Button
        variant="secondary"
        size="sm"
        onClick={onContribute}
        style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
      >
        <PlusCircle size={14} /> Registrar aporte
      </Button>
    </div>
  );
}