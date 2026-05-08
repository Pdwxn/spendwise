import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center py-8 sm:py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--accent-strong)]">SpendWise</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-6xl">
              Controla tu dinero sin perder claridad.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-[color:var(--foreground)]/72 sm:text-lg">
              Visualiza tus ingresos, gastos, presupuestos y metas de ahorro en un solo lugar, con una experiencia clara, rápida y fácil de usar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[color:var(--button-primary-from)] via-[color:var(--button-primary-via)] to-[color:var(--button-primary-to)] px-4 py-2 text-sm font-medium text-[color:var(--button-primary-text)] shadow-lg shadow-[color:var(--button-shadow)] transition-all hover:brightness-110 sm:w-auto">
              Crear cuenta
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-all hover:bg-[color:var(--surface-strong)] sm:w-auto">
              Iniciar sesión
            </Link>
          </div>

          <p className="text-sm text-[color:var(--foreground)]/52">Menos hojas de cálculo. Más control sobre tu dinero.</p>
        </section>

        <Card variant="highlight" className="space-y-6 p-6 sm:p-8 lg:min-h-[520px] lg:space-y-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Vista previa</p>
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Resumen financiero</h2>
            <p className="max-w-md text-sm leading-relaxed text-[color:var(--foreground)]/68">
              Una vista rápida de tus números principales, pensada para entender tu situación sin ruido visual.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-h-32 flex-col justify-between rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/48">Balance</p>
              <p className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">$12,480</p>
              <p className="text-xs text-[color:var(--foreground)]/50">Saldo disponible hoy</p>
            </div>
            <div className="flex min-h-32 flex-col justify-between rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] sm:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/48">Ahorro</p>
              <p className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">$4,200</p>
              <p className="text-xs text-[color:var(--foreground)]/50">Objetivo mensual alcanzado al 50%</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[color:var(--foreground)]">Detecta en qué se va tu dinero, mide tu progreso mensual y mantén tus ahorros bajo control.</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--border)]/70">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[color:var(--button-primary-from)] via-[color:var(--button-primary-via)] to-[color:var(--button-primary-to)]" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
