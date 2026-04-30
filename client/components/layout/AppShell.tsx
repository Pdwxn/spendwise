import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <main className="flex-1">{children}</main>
      </div>
      <BottomNavigation />
    </div>
  );
}
