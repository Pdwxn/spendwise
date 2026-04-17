'use client';

interface ProgressBarProps {
  value: number;       // 0–100 (capped visually at 100, label shows real value)
  color?: string;
  exceeded?: boolean;
  showLabel?: boolean;
}

export function ProgressBar({ value, color, exceeded, showLabel }: ProgressBarProps) {
  const clamped  = Math.min(value, 100);
  const barColor = exceeded ? 'var(--color-warning)' : (color ?? 'var(--color-accent)');

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height: '6px',
        background: 'var(--color-surface-3)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${clamped}%`,
          background: barColor,
          borderRadius: '999px',
          transition: 'width 0.4s ease',
          boxShadow: exceeded ? `0 0 8px ${barColor}66` : 'none',
        }} />
      </div>
      {showLabel && (
        <div style={{
          fontSize: '0.72rem',
          color: exceeded ? 'var(--color-warning)' : 'var(--color-text-3)',
          marginTop: '0.3rem',
          textAlign: 'right',
        }}>
          {value.toFixed(0)}%{exceeded ? ' — superado' : ''}
        </div>
      )}
    </div>
  );
}