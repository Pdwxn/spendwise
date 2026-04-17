'use client';

import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import type { Account } from '@/types';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
];

interface AccountFormProps {
  initial?: Partial<Account>;
  onSubmit: (data: Omit<Account, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const [name,           setName]           = useState(initial?.name           ?? '');
  const [color,          setColor]          = useState(initial?.color          ?? PRESET_COLORS[0]);
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
          {initial?.name ? 'Guardar cambios' : 'Crear cuenta'}
        </Button>
      </div>
    </div>
  );
}