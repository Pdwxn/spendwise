'use client';

import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, color, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: color ? `${color}22` : 'var(--color-surface-3)',
        color: color ?? 'var(--color-text-2)',
        border: `1px solid ${color ? `${color}44` : 'var(--color-border)'}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}