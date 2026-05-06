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
import { ApiError } from "@/lib/api";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

type FieldErrors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "general", string>>;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const inputErrorClass = "border-rose-400/60 focus:border-rose-300/70 focus:ring-rose-300/25";

  function parseFieldErrors(payload: unknown): FieldErrors {
    if (!payload || typeof payload !== "object") {
      return {};
    }

    const record = payload as Record<string, unknown>;
    const nextErrors: FieldErrors = {};

    for (const key of ["firstName", "lastName", "email", "password"] as const) {
      const value = record[key];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        nextErrors[key] = value[0];
      } else if (typeof value === "string") {
        nextErrors[key] = value;
      }
    }

    const generalValue = record.detail ?? record.non_field_errors;
    if (typeof generalValue === "string") {
      nextErrors.general = generalValue;
    } else if (Array.isArray(generalValue) && generalValue.length > 0 && typeof generalValue[0] === "string") {
      nextErrors.general = generalValue[0];
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const nextFieldErrors: FieldErrors = {};

    if (mode === "register") {
      if (!firstName.trim()) {
        nextFieldErrors.firstName = "El nombre es obligatorio.";
      }

      if (!lastName.trim()) {
        nextFieldErrors.lastName = "El apellido es obligatorio.";
      }
    }

    if (!email.trim()) {
      nextFieldErrors.email = "El correo es obligatorio.";
    }

    if (password.length < 8) {
      nextFieldErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ firstName, lastName, email, password });
      }

      router.push("/dashboard");
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        const nextErrors = parseFieldErrors(submitError.payload);
        setFieldErrors(nextErrors);
        setError(nextErrors.general ?? submitError.message);
      } else {
        setError(submitError instanceof Error ? submitError.message : "No se pudo completar el acceso.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="space-y-6 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--foreground)]/50">SpendWise</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">{copy[mode].title}</h1>
        <p className="text-sm leading-relaxed text-[color:var(--foreground)]/65">{copy[mode].description}</p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        {mode === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[color:var(--foreground)]">
              <span>Nombre</span>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="María"
                required
                className={fieldErrors.firstName ? inputErrorClass : undefined}
              />
              {fieldErrors.firstName ? <p className="text-xs text-rose-200">{fieldErrors.firstName}</p> : null}
            </label>
            <label className="space-y-2 text-sm font-medium text-[color:var(--foreground)]">
              <span>Apellido</span>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="García"
                required
                className={fieldErrors.lastName ? inputErrorClass : undefined}
              />
              {fieldErrors.lastName ? <p className="text-xs text-rose-200">{fieldErrors.lastName}</p> : null}
            </label>
          </div>
        ) : null}

        <label className="space-y-2 text-sm font-medium text-[color:var(--foreground)]">
          <span>Correo electrónico</span>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="maria@correo.com"
            required
            className={fieldErrors.email ? inputErrorClass : undefined}
          />
          {fieldErrors.email ? <p className="text-xs text-rose-200">{fieldErrors.email}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-[color:var(--foreground)]">
          <span>Contraseña</span>
          <Input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className={fieldErrors.password ? inputErrorClass : undefined}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-rose-200">{fieldErrors.password}</p>
          ) : mode === "register" ? (
            <p className="text-xs text-[color:var(--foreground)]/50">Usa 8 caracteres o más. Las contraseñas comunes se rechazan.</p>
          ) : null}
        </label>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : copy[mode].submit}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/40">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleSignInButton
          onToken={async (token) => {
            setError(null);
            setFieldErrors({});
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

      <p className="text-sm text-[color:var(--foreground)]/65">
        {copy[mode].footer.label} <Link href={copy[mode].footer.href} className="font-medium text-cyan-700 hover:text-cyan-900">{copy[mode].footer.linkText}</Link>
      </p>
    </Card>
  );
}
