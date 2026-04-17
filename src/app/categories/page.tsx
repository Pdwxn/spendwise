'use client';
import { PageHeader, Button, Modal, FormField, EmptyState, Badge } from '@/components/ui';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import type { Category } from '@/types';
import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency } from '@/utils/calculations';
import Link from 'next/link';

const PRESET_COLORS = [
  '#10b981','#6366f1','#f59e0b','#f43f5e',
  '#3b82f6','#a855f7','#14b8a6','#ec4899',
  '#84cc16','#06b6d4','#fb923c','#e879f9',
];

const PRESET_EMOJIS = [
  '🍕','🚌','💊','🎬','🏠','💼','☕','🛒',
  '💡','🏋️','✈️','📚','🎮','👕','🐾','💰',
];

// ── CategoryForm ─────────────────────────────────────────────

interface CategoryFormProps {
  initial?: Partial<Category>;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
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

// ── Page ─────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { state, dispatch, transactionsByCategory } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Category | null>(null);

  function handleCreate(data: Omit<Category, 'id' | 'createdAt'>) {
    dispatch({ type: 'ADD_CATEGORY', payload: data });
    setModalOpen(false);
  }

  function handleEdit(data: Omit<Category, 'id' | 'createdAt'>) {
    if (!editing) return;
    dispatch({ type: 'EDIT_CATEGORY', payload: { id: editing.id, ...data } });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los presupuestos asociados también se eliminarán.')) return;
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Categorías"
        subtitle={`${state.categories.length} categoría${state.categories.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Nueva categoría
          </Button>
        }
      />

      {state.categories.length === 0 ? (
        <EmptyState
          emoji="🏷️"
          title="Sin categorías"
          description="Crea categorías para clasificar tus transacciones."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Nueva categoría
            </Button>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {state.categories.map((cat) => {
            const txs   = transactionsByCategory(cat.id);
            const total = txs.reduce((s, t) => t.type === 'expense' ? s + t.amount : s, 0);
            return (
              <div key={cat.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: `${cat.color}22`,
                    border: `1px solid ${cat.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                      {txs.length} transacci{txs.length === 1 ? 'ón' : 'ones'}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem', fontWeight: 600,
                  color: cat.color, marginBottom: '1rem',
                }}>
                  {formatCurrency(total)}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    href={`/categories/${cat.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.78rem', color: 'var(--color-accent)',
                      textDecoration: 'none',
                    }}
                  >
                    Ver transacciones <ArrowRight size={12} />
                  </Link>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(cat)} style={{ padding: '0.35rem' }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}
                      style={{ padding: '0.35rem', color: 'var(--color-expense)' }}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva categoría">
        <CategoryForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar categoría">
        {editing && (
          <CategoryForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}