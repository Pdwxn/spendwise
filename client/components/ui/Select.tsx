import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={`h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-base text-[color:var(--foreground)] outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:bg-[color:var(--surface-strong)] sm:text-sm ${className ?? ""}`}
      {...props}
    />
  );
}
