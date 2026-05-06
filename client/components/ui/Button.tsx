import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-[color:var(--button-primary-from)] via-[color:var(--button-primary-via)] to-[color:var(--button-primary-to)] text-[color:var(--button-primary-text)] shadow-lg hover:brightness-105",
  secondary: "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-strong)]",
  ghost: "bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface)]",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[color:var(--button-primary-via)]/70 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
