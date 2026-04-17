'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/calculations';
import { Button } from '@/components/ui';
import { Pencil, Trash2, ArrowRight } from 'lucide-react';
import type { Category, Transaction } from '@/types';

interface CategoryCardProps {
  category: Category;
  transactions: Transaction[];
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({ category, transactions, onEdit, onDelete }: CategoryCardProps) {
  const total = transactions.reduce(
    (sum, t) => (t.type === 'expense' ? sum + t.amount : sum),
    0
  );

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: 'var(--radius-md)',
          background: `${category.color}22`,
          border: `1px solid ${category.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {category.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{category.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
            {transactions.length} transacci{transactions.length === 1 ? 'ón' : 'ones'}
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.1rem', fontWeight: 600,
        color: category.color, marginBottom: '1rem',
      }}>
        {formatCurrency(total)}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href={`/categories/${category.id}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          Ver transacciones <ArrowRight size={12} />
        </Link>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <Button variant="ghost" size="sm" onClick={onEdit} style={{ padding: '0.35rem' }}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}
            style={{ padding: '0.35rem', color: 'var(--color-expense)' }}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}