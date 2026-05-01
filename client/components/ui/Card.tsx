import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/7 p-4 text-cyan-50 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className ?? ""}`}
      {...props}
    />
  );
}
