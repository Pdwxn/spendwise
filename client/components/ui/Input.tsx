import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-cyan-50 outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:bg-slate-900/40 ${className ?? ""}`}
      {...props}
    />
  );
}
