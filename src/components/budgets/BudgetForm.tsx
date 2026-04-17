'use client';

import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { formatMonth } from '@/utils/calculations';
import { Button, FormField } from '@/components/ui';
import type { Budget } from '@/types';

interface BudgetFormProps {
  month: string;
  initial?: Partial<Budget>;
  onSubmit: (data: Omit<Budget, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function BudgetForm({ month, initial, onSubmit, onCancel }: BudgetFormProps) {
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