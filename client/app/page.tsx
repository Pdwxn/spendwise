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
              Registra ingresos, gastos, presupuestos y ahorros en un panel privado con acceso por correo o Google.
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

          <p className="text-sm text-[color:var(--foreground)]/52">Tu información queda separada por usuario desde el primer acceso.</p>
        </section>

        <Card variant="highlight" className="space-y-4 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">Vista previa</p>
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Resumen privado</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/48">Balance</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">$12,480</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/48">Ahorro</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">$4,200</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-sm font-medium text-[color:var(--foreground)]">Registra movimientos, revisa presupuestos y sigue metas de ahorro desde un solo lugar.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
