import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110",
  secondary: "bg-white/8 text-cyan-50 border border-white/10 hover:bg-white/12",
  ghost: "bg-transparent text-cyan-50 hover:bg-white/8",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
