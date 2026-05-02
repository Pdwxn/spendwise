import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-cyan-50 sm:text-3xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-relaxed text-cyan-100/65">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
