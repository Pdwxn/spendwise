'use client';

import { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function FormField({ label, children, style }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', ...style }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}