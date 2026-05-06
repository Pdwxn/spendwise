"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  IconBell,
  IconChevronLeft,
  IconLogout,
  IconSettings,
  IconShieldLock,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

type DrawerView = "menu" | "profile" | "preferences" | "security";

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  if (initials) {
    return initials.toUpperCase();
  }

  if (email?.[0]) {
    return email[0].toUpperCase();
  }

  return "U";
}

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DrawerView>("menu");
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = useMemo(() => getInitials(user?.firstName, user?.lastName, user?.email), [user]);
  const providerLabel = useMemo(() => {
    switch (user?.authProvider) {
      case "google":
        return "Google";
      case "both":
        return "Email + Google";
      default:
        return "Email";
    }
  }, [user?.authProvider]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setAvatarFailed(false), 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [user?.avatarUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    await logout();
    toast.success("Sesión cerrada");
    setOpen(false);
    router.replace("/login");
  }

  function closeDrawer() {
    setOpen(false);
    setView("menu");
  }

  function openSection(nextView: Exclude<DrawerView, "menu">) {
    setView(nextView);
  }

  function goBack() {
    setView("menu");
  }

  const activeSection =
    view === "profile"
      ? {
          title: "Perfil",
          description: "Actualiza nombre, correo y avatar desde un solo lugar.",
          icon: IconUserCircle,
          accent: "from-cyan-300/20 to-teal-300/10",
          status: "Información de cuenta",
        }
      : view === "preferences"
        ? {
            title: "Preferencias",
            description: "Configura moneda, idioma y apariencia para toda la app.",
            icon: IconBell,
            accent: "from-violet-300/20 to-fuchsia-300/10",
            status: "Visualización y notificaciones",
          }
        : view === "security"
          ? {
              title: "Seguridad",
              description: "Gestiona contraseña y futuras opciones de sesión.",
              icon: IconShieldLock,
              accent: "from-rose-300/20 to-orange-300/10",
              status: "Acceso y protección",
            }
          : null;

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Abrir menú de usuario"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-sm font-semibold text-cyan-50 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all hover:bg-white/[0.12] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-300/60 sm:right-6 sm:top-6"
      >
        {initials}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={closeDrawer} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,22rem)] flex-col border-l border-white/10 bg-slate-950/96 p-5 text-cyan-50 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/45">Cuenta</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {activeSection?.title ?? `${user?.firstName ?? "Usuario"} ${user?.lastName ?? ""}`}
                </h2>
                <p className="text-sm text-cyan-100/65">{activeSection?.status ?? user?.email ?? "sin correo"}</p>
              </div>
              <button
                type="button"
                aria-label={view === "menu" ? "Cerrar menú de usuario" : "Volver al menú"}
                onClick={view === "menu" ? closeDrawer : goBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-50 transition hover:bg-white/[0.1]"
              >
                {view === "menu" ? <IconX size={18} /> : <IconChevronLeft size={18} />}
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-300 via-teal-300 to-violet-300 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20">
                {user?.avatarUrl && !avatarFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt="Avatar del usuario"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cyan-50">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-cyan-100/60">Proveedor: {providerLabel}</p>
              </div>
            </div>

            {view === "menu" ? (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-50">
                  <IconSettings size={18} className="text-cyan-200/80" />
                  <span>Configuración</span>
                </div>

                <div className="space-y-2">
                  {[
                    { view: "profile" as const, icon: IconUserCircle, title: "Perfil", description: "Nombre, correo y foto" },
                    { view: "preferences" as const, icon: IconBell, title: "Preferencias", description: "Moneda, idioma y tema" },
                    { view: "security" as const, icon: IconShieldLock, title: "Seguridad", description: "Contraseña y sesión" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => openSection(item.view)}
                        className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-200">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-cyan-50">{item.title}</p>
                          <p className="text-xs text-cyan-100/60">{item.description}</p>
                        </div>
                        <IconChevronLeft size={16} className="rotate-180 text-cyan-100/40" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeSection ? (
              <div className={`mt-6 rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${activeSection.accent} p-4`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-50">
                    <activeSection.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-cyan-50">{activeSection.title}</p>
                    <p className="mt-1 text-sm leading-6 text-cyan-50/80">{activeSection.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-100/45">Vista interna</p>
                  <p className="text-sm text-cyan-50/80">
                    Esta sección ya queda preparada para abrir su pantalla completa sin salir del flujo del drawer.
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="flex-1 justify-center" onClick={goBack}>
                    <IconChevronLeft size={18} />
                    Volver
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-auto pt-6">
              <Button
                variant="secondary"
                className="w-full justify-center border border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15"
                onClick={() => void handleLogout()}
              >
                <IconLogout size={18} />
                Cerrar sesión
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
