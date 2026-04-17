'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  Target,
  PiggyBank,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacciones',  icon: ArrowLeftRight },
  { href: '/accounts',     label: 'Cuentas',        icon: Wallet },
  { href: '/categories',   label: 'Categorías',     icon: Tag },
  { href: '/budgets',      label: 'Presupuestos',   icon: Target },
  { href: '/savings',      label: 'Ahorros',        icon: PiggyBank },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '220px',
      height: '100vh',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1.25rem 1.25rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
        }}>
          Spend<span style={{ color: 'var(--color-accent)' }}>Wise</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', marginTop: '2px' }}>
          Finanzas personales
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--color-accent)' : 'var(--color-text-2)',
                background: active ? 'var(--color-accent-bg)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.72rem',
        color: 'var(--color-text-3)',
      }}>
        v1.0.0
      </div>
    </aside>
  );
}