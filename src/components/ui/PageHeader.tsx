'use client';

import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '2rem',
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 400,
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-2)', fontSize: '0.875rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}