'use client';

import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import type { SavingsGoal } from '@/types';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
];

interface SavingsGoalFormProps {
  initial?: Partial<SavingsGoal>;
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'accumulated'>) => void;
  onCancel: () => void;
}

export function SavingsGoalForm({ initial, onSubmit, onCancel }: SavingsGoalFormProps) {
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