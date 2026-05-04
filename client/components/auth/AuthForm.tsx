"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

const copy = {
  login: {
    title: "Bienvenido de vuelta",
    description: "Accede a tu panel para revisar cuentas, gastos y ahorros.",
    submit: "Entrar",
    footer: {
      label: "¿No tienes cuenta?",
      href: "/register",
      linkText: "Crea una",
    },
  },
  register: {
    title: "Crea tu cuenta",
    description: "Empieza a organizar tu dinero con un panel privado.",
    submit: "Crear cuenta",
    footer: {
      label: "¿Ya tienes cuenta?",
      href: "/login",
      linkText: "Inicia sesión",
    },
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ firstName, lastName, email, password });
      }

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo completar el acceso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="space-y-6 border-white/10 bg-white/[0.045] p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/50">SpendWise</p>
        <h1 className="text-3xl font-semibold tracking-tight text-cyan-50">{copy[mode].title}</h1>
        <p className="text-sm leading-relaxed text-cyan-100/65">{copy[mode].description}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-cyan-50">
              <span>Nombre</span>
              <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="María" required />
            </label>
            <label className="space-y-2 text-sm font-medium text-cyan-50">
              <span>Apellido</span>
              <Input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="García" required />
            </label>
          </div>
        ) : null}

        <label className="space-y-2 text-sm font-medium text-cyan-50">
          <span>Correo electrónico</span>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="maria@correo.com"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-cyan-50">
          <span>Contraseña</span>
          <Input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
        </label>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : copy[mode].submit}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-100/40">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleSignInButton
          onToken={async (token) => {
            setError(null);
            setIsSubmitting(true);

            try {
              await loginWithGoogle(token);
              router.push("/dashboard");
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar con Google.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </div>

      <p className="text-sm text-cyan-100/65">
        {copy[mode].footer.label} <Link href={copy[mode].footer.href} className="font-medium text-cyan-200 hover:text-cyan-50">{copy[mode].footer.linkText}</Link>
      </p>
    </Card>
  );
}
