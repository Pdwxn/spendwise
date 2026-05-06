"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { UserMenu } from "@/components/layout/UserMenu";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register";
  const showBottomNavigation = !isPublicRoute;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isPublicRoute && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, isPublicRoute, pathname, router]);

  return (
    <div className="relative min-h-screen overflow-hidden text-cyan-50">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-500/16 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-300/8 blur-3xl" />
      </div>
      <div
        className={`relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 ${
          showBottomNavigation ? "pb-28" : "pb-10"
        }`}
      >
        <main className="flex-1">{children}</main>
      </div>
      {showBottomNavigation ? <BottomNavigation /> : null}
      {showBottomNavigation ? <UserMenu /> : null}
      <ToastProvider />
    </div>
  );
}
