"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/accounts", label: "Cuentas" },
  { href: "/transactions", label: "Movimientos" },
  { href: "/budgets", label: "Presupuestos" },
  { href: "/savings", label: "Ahorros" },
  { href: "/categories", label: "Categorías" },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/70 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-6xl grid-cols-6 gap-1 text-[0.625rem] font-medium text-cyan-100/70">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center rounded-xl px-2 py-2 transition-colors ${
                isActive
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "hover:bg-white/8 hover:text-cyan-50"
              }`}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
