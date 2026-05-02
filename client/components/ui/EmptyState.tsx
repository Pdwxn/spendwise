import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/12 bg-white/5 p-6 text-center shadow-lg backdrop-blur-xl sm:p-8">
      <h2 className="text-lg font-semibold text-cyan-50">{title}</h2>
      <p className="mt-2 text-sm text-cyan-100/65">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
