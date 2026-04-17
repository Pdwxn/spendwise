'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: '1px solid var(--color-accent)',
  },
  secondary: {
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-2)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-expense)',
    border: '1px solid var(--color-expense)',
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: '0.8rem',   padding: '0.35rem 0.75rem' },
  md: { fontSize: '0.875rem', padding: '0.55rem 1.1rem'  },
  lg: { fontSize: '0.95rem',  padding: '0.7rem 1.5rem'   },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        outline: 'none',
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}