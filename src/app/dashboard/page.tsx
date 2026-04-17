'use client'
import { calcCategoryChartData, formatCurrency, formatMonth, currentMonth, calcMonthSummary } from '@/utils/calculations';
import { PageHeader} from '@/components/ui';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useMemo, useState } from 'react';

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardPage() {
  const { state } = useFinance();
  const [month, setMonth] = useState(currentMonth());
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const summary = useMemo(
    () => calcMonthSummary(state.transactions, state.savingsGoals, month),
    [state.transactions, state.savingsGoals, month]
  );

  const chartData = useMemo(
    () => calcCategoryChartData(
      state.transactions.filter((t) => t.date.startsWith(month)),
      state.categories,
      chartType
    ),
    [state.transactions, state.categories, month, chartType]
  );

  const recentTransactions = useMemo(
    () => [...state.transactions]
      .filter((t) => t.date.startsWith(month))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    [state.transactions, month]
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen financiero del mes"
      />

      {/* Month selector */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-2)',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          minWidth: '120px', textAlign: 'center',
          textTransform: 'capitalize',
        }}>
          {formatMonth(month)}
        </span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-2)',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={16} />
        </button>
        {month !== currentMonth() && (
          <button
            onClick={() => setMonth(currentMonth())}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-accent)', fontSize: '0.78rem',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Hoy
          </button>
        )}
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} />

      {/* Chart */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '1.5rem',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '0.875rem', fontWeight: 600,
            color: 'var(--color-text)', letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            Por categoría
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem', fontWeight: 500,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderColor: chartType === t ? (t === 'expense' ? 'var(--color-expense)' : 'var(--color-income)') : 'var(--color-border)',
                  background: chartType === t ? (t === 'expense' ? '#f43f5e22' : '#10b98122') : 'transparent',
                  color: chartType === t ? (t === 'expense' ? 'var(--color-expense)' : 'var(--color-income)') : 'var(--color-text-3)',
                }}
              >
                {t === 'expense' ? 'Gastos' : 'Ingresos'}
              </button>
            ))}
          </div>
        </div>
        <CategoryChart data={chartData} />
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{
          margin: '0 0 1.25rem',
          fontSize: '0.875rem', fontWeight: 600,
          color: 'var(--color-text)', letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          Últimas transacciones
        </h2>
        {recentTransactions.length === 0 ? (
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem', margin: 0 }}>
            Sin transacciones este mes.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTransactions.map((tx) => {
              const cat = state.categories.find((c) => c.id === tx.categoryId);
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{cat?.emoji ?? '•'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description || cat?.name || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                      {tx.date}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}