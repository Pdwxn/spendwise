import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-950 text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-950 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-950 hover:bg-slate-100",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
