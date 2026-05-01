import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
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
      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar
        closeButton={false}
        newestOnTop
        pauseOnFocusLoss={false}
        toastClassName="mx-4 mb-20 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-lg"
      />
    </div>
  );
}
