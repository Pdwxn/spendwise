'use client';

import type { MonthSummary } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { TrendingUp, TrendingDown, Scale, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Ingresos',
      value: summary.income,
      icon: TrendingUp,
      color: 'var(--color-income)',
      bg: '#10b98112',
    },
    {
      label: 'Gastos',
      value: summary.expenses,
      icon: TrendingDown,
      color: 'var(--color-expense)',
      bg: '#f43f5e12',
    },
    {
      label: 'Balance',
      value: summary.balance,
      icon: Scale,
      color: summary.balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
      bg: summary.balance >= 0 ? '#10b98112' : '#f43f5e12',
    },
    {
      label: 'Ahorro esperado',
      value: summary.expectedSavings,
      icon: PiggyBank,
      color: 'var(--color-info)',
      bg: '#6366f112',
    },
  ];

  return (
    <div className="stagger" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
    }}>
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="card animate-in"
          style={{ padding: '1.25rem 1.5rem' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '0.85rem',
          }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--color-text-3)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {label}
            </span>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-md)',
              background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} color={color} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.4rem',
            fontWeight: 600,
            color,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
          </div>
        </div>
      ))}
    </div>
  );
}