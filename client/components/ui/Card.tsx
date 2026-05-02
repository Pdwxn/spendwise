import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

type CardVariant = "default" | "highlight" | "subtle";

type CardOwnProps = {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-white/10 bg-white/[0.05] shadow-[0_18px_50px_rgba(0,0,0,0.28)]",
  highlight: "border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 via-teal-300/12 to-violet-400/10 shadow-[0_20px_70px_rgba(34,211,238,0.14)]",
  subtle: "border-white/8 bg-white/[0.035] shadow-[0_12px_34px_rgba(0,0,0,0.2)]",
};

export function Card({ className, variant = "default", ...props }: CardProps & CardOwnProps) {
  return (
    <div
      className={`rounded-3xl border p-4 text-cyan-50 backdrop-blur-xl ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
