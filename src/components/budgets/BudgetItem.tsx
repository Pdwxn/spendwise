'use client';

import { useFinance } from '@/hooks/useFinance';
import { formatMonth } from '@/utils/calculations';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

interface TransactionFiltersProps {
  month: string;
  categoryId: string;
  type: string;
  onMonthChange: (month: string) => void;
  onCategoryChange: (id: string) => void;
  onTypeChange: (type: string) => void;
}

export function TransactionFilters({
  month,
  categoryId,
  type,
  onMonthChange,
  onCategoryChange,
  onTypeChange,
}: TransactionFiltersProps) {
  const { state } = useFinance();
  const hasFilters = !!categoryId || !!type;

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onMonthChange(addMonths(month, -1))}
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text)', minWidth: '110px', textAlign: 'center', textTransform: 'capitalize' }}>
          {formatMonth(month)}
        </span>
        <button
          onClick={() => onMonthChange(addMonths(month, 1))}
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-2)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Category filter */}
      <select
        className="input"
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ width: 'auto', minWidth: '160px' }}
      >
        <option value="">Todas las categorías</option>
        {state.categories.map((c) => (
          <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
        ))}
      </select>

      {/* Type filter */}
      <select
        className="input"
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        style={{ width: 'auto', minWidth: '130px' }}
      >
        <option value="">Todos los tipos</option>
        <option value="expense">Gastos</option>
        <option value="income">Ingresos</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => { onCategoryChange(''); onTypeChange(''); }}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}