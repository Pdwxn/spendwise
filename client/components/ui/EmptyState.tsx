import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-lg backdrop-blur-xl sm:p-8">
      <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h2>
      <p className="mt-2 text-sm text-[color:var(--foreground)]/70">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
