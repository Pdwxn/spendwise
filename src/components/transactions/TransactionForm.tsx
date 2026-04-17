'use client';

import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import type { Category } from '@/types';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
  '#84cc16','#06b6d4','#fb923c','#e879f9',
];

const PRESET_EMOJIS = [
  '🍕','🚌','💊','🎬','🏠','💼','☕','🛒',
  '💡','🏋️','✈️','📚','🎮','👕','🐾','💰',
];

interface CategoryFormProps {
  initial?: Partial<Category>;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name,  setName]  = useState(initial?.name  ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? PRESET_EMOJIS[0]);
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), emoji, color });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <FormField label="Nombre">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej. Alimentación, Transporte…"
        />
      </FormField>

      <FormField label="Emoji">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {PRESET_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              style={{
                width: '36px', height: '36px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${emoji === e ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: emoji === e ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                fontSize: '1.1rem', cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {e}
            </button>
          ))}
          <input
            className="input"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Otro…"
            style={{ width: '80px', textAlign: 'center', fontSize: '1rem' }}
          />
        </div>
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
          {initial?.name ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </div>
  );
}