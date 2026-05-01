type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  indicatorClassName?: string;
};

export function ProgressBar({ value, max = 100, label, indicatorClassName = "bg-slate-950" }: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className="space-y-2">
      {label ? <div className="flex items-center justify-between text-sm text-slate-600"><span>{label}</span><span>{Math.round(percentage)}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={Math.round(value)}>
        <div className={`h-full rounded-full transition-[width] ${indicatorClassName}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
