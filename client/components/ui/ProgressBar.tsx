type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
};

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className="space-y-2">
      {label ? <div className="flex items-center justify-between text-sm text-slate-600"><span>{label}</span><span>{Math.round(percentage)}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={Math.round(value)}>
        <div className="h-full rounded-full bg-slate-950 transition-[width]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
