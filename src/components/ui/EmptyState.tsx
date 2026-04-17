'use client';

import { type ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      color: 'var(--color-text-3)',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{emoji}</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.875rem', maxWidth: '280px', lineHeight: 1.6, marginBottom: action ? '1.5rem' : 0 }}>
        {description}
      </div>
      {action}
    </div>
  );
}