"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowsExchange,
  IconChartPie,
  IconHome,
  IconPigMoney,
  IconTags,
  IconWallet,
} from "@tabler/icons-react";

const items = [
  { href: "/dashboard", label: "Inicio", icon: IconHome },
  { href: "/accounts", label: "Cuentas", icon: IconWallet },
  { href: "/transactions", label: "Movimientos", icon: IconArrowsExchange },
  { href: "/budgets", label: "Presupuestos", icon: IconChartPie },
  { href: "/savings", label: "Ahorros", icon: IconPigMoney },
  { href: "/categories", label: "Categorías", icon: IconTags },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface-strong)] px-2 pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-6xl grid-cols-6 gap-1 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[0.625rem] font-medium text-[color:var(--foreground)]/70">
        {items.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 py-2 transition-colors ${
                isActive
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <Icon size={20} stroke={1.85} />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
