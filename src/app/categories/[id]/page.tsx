'use client';
import Link from 'next/link';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency, totalIncome, totalExpenses } from '@/utils/calculations';
import { PageHeader, Badge, EmptyState } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CategoryDetailPage({ params }: Props) {
  const { id } = use(params);
  const { state, categoryById, transactionsByCategory } = useFinance();

  const category = categoryById(id);
  const transactions = transactionsByCategory(id)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!category) {
    return (
      <div>
        <Link href="/categories" style={{ color: 'var(--color-text-3)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Categorías
        </Link>
        <p style={{ color: 'var(--color-text-2)', marginTop: '2rem' }}>Categoría no encontrada.</p>
      </div>
    );
  }

  const income   = totalIncome(transactions);
  const expenses = totalExpenses(transactions);

  return (
    <div className="animate-in">
      <Link href="/categories" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        color: 'var(--color-text-3)', textDecoration: 'none',
        fontSize: '0.8rem', marginBottom: '1.5rem',
      }}>
        <ArrowLeft size={13} /> Categorías
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: `${category.color}22`,
          border: `1px solid ${category.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }}>
          {category.emoji}
        </div>
        <div>
          <h1 style={{
            margin: 0, fontFamily: 'var(--font-display)',
            fontSize: '1.8rem', fontWeight: 400,
            color: 'var(--color-text)', lineHeight: 1.2,
          }}>
            {category.name}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            {transactions.length} transacci{transactions.length === 1 ? 'ón' : 'ones'} en total
          </p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.1rem 1.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Total gastos
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-expense)' }}>
            {formatCurrency(expenses)}
          </div>
        </div>
        <div className="card" style={{ padding: '1.1rem 1.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Total ingresos
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-income)' }}>
            {formatCurrency(income)}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {transactions.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="Sin transacciones"
            description="Esta categoría no tiene transacciones aún."
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Fecha', 'Descripción', 'Cuenta', 'Monto'].map((h) => (
                  <th key={h} style={{
                    padding: '0.75rem 1.25rem',
                    textAlign: h === 'Monto' ? 'right' : 'left',
                    fontSize: '0.72rem', fontWeight: 600,
                    color: 'var(--color-text-3)',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => {
                const account = state.accounts.find((a) => a.id === tx.accountId);
                return (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                      {tx.date}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {tx.description || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {account ? (
                        <Badge color={account.color}>{account.name}</Badge>
                      ) : (
                        <span style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td style={{
                      padding: '0.85rem 1.25rem',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600,
                      color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}