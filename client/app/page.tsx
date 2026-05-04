import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center py-8 sm:py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/50">SpendWise</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-cyan-50 sm:text-6xl">
              Controla tu dinero sin perder claridad.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-cyan-100/68 sm:text-lg">
              Registra ingresos, gastos, presupuestos y ahorros en un panel privado con acceso por correo o Google.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 sm:w-auto">
              Crear cuenta
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-cyan-50 transition-all hover:bg-white/[0.1] sm:w-auto">
              Iniciar sesión
            </Link>
          </div>

          <p className="text-sm text-cyan-100/45">Tu información queda separada por usuario desde el primer acceso.</p>
        </section>

        <Card variant="highlight" className="space-y-4 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/50">Vista previa</p>
            <h2 className="text-2xl font-semibold text-cyan-50">Resumen privado</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/40">Balance</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-50">$12,480</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/40">Ahorro</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-50">$4,200</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-sm font-medium text-cyan-50">Registra movimientos, revisa presupuestos y sigue metas de ahorro desde un solo lugar.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
