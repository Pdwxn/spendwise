"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { usePreferences } from "@/context/PreferencesContext";
import { requestWithAuth } from "@/lib/authRequest";
import {
  PreferencesPanel,
  ProfilePanel,
  SecurityPanel,
  type ProfileFormState,
  type SecurityFormState,
} from "@/components/layout/UserMenuPanels";

type DrawerView = "menu" | "profile" | "preferences" | "security";

type SectionMeta = {
  title: string;
  description: string;
  icon: typeof IconUserCircle;
  accent: string;
  status: string;
};

const SECTION_META: Record<Exclude<DrawerView, "menu">, SectionMeta> = {
  profile: {
    title: "Perfil",
    description: "Actualiza nombre, correo y avatar desde un solo lugar.",
    icon: IconUserCircle,
    accent: "from-cyan-300/20 to-teal-300/10",
    status: "Información de cuenta",
  },
  preferences: {
    title: "Preferencias",
    description: "Configura moneda, idioma y apariencia para toda la app.",
    icon: IconBell,
    accent: "from-violet-300/20 to-fuchsia-300/10",
    status: "Visualización y notificaciones",
  },
  security: {
    title: "Seguridad",
    description: "Gestiona contraseña y futuras opciones de sesión.",
    icon: IconShieldLock,
    accent: "from-rose-300/20 to-orange-300/10",
    status: "Acceso y protección",
  },
};

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
  const { user, accessToken, logout, refreshSession, updateUser } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DrawerView>("menu");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({ firstName: "", lastName: "", avatarUrl: "" });
  const [securityForm, setSecurityForm] = useState<SecurityFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  const [preferencesStatus, setPreferencesStatus] = useState<"idle" | "saving" | "saved">("idle");
  const preferencesStatusTimer = useRef<number | null>(null);

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
    if (!open || view !== "profile") {
      return;
    }

    const timer = window.setTimeout(() => {
      setProfileForm({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        avatarUrl: user?.avatarUrl ?? "",
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, user, view]);

  useEffect(() => {
    if (!open || view !== "security") {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, view]);

  useEffect(() => {
    return () => {
      if (preferencesStatusTimer.current !== null) {
        window.clearTimeout(preferencesStatusTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDrawer();
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
    closeDrawer();
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

  async function handleProfileSave() {
    if (isProfileSaving) {
      return;
    }

    if (!accessToken) {
      toast.error("No hay sesión activa.");
      return;
    }

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const avatarUrl = profileForm.avatarUrl.trim();

    if (!firstName || !lastName) {
      toast.error("El nombre y el apellido son obligatorios.");
      return;
    }

    setIsProfileSaving(true);

    try {
      const response = (await requestWithAuth(accessToken, refreshSession, "/api/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({ firstName, lastName, avatarUrl }),
      })) as {
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string | null;
        authProvider: "email" | "google" | "both";
      };

      updateUser({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        avatarUrl: response.avatarUrl ?? null,
        authProvider: response.authProvider,
      });
      toast.success("Perfil actualizado");
      setAvatarFailed(false);
      setView("menu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function handlePreferenceChange<K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) {
    if (isPreferencesSaving) {
      return;
    }

    setIsPreferencesSaving(true);
    setPreferencesStatus("saving");

    try {
      await updatePreferences({ [key]: value } as Partial<typeof preferences>);
      setPreferencesStatus("saved");
      if (preferencesStatusTimer.current !== null) {
        window.clearTimeout(preferencesStatusTimer.current);
      }
      preferencesStatusTimer.current = window.setTimeout(() => {
        setPreferencesStatus("idle");
      }, 1500);
    } catch (error) {
      setPreferencesStatus("idle");
      toast.error(error instanceof Error ? error.message : "No se pudieron guardar las preferencias.");
    } finally {
      setIsPreferencesSaving(false);
    }
  }

  async function handleSecuritySave() {
    if (isSecuritySaving) {
      return;
    }

    if (!accessToken) {
      toast.error("No hay sesión activa.");
      return;
    }

    if (!securityForm.currentPassword.trim()) {
      toast.error("La contraseña actual es obligatoria.");
      return;
    }

    if (securityForm.newPassword.trim().length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!securityForm.confirmPassword.trim()) {
      toast.error("Confirma la nueva contraseña.");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsSecuritySaving(true);

    try {
      await requestWithAuth(accessToken, refreshSession, "/api/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
          confirmPassword: securityForm.confirmPassword,
        }),
      });

      toast.success("Contraseña actualizada");
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setView("menu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la contraseña.");
    } finally {
      setIsSecuritySaving(false);
    }
  }

  const activeSection = view === "menu" ? null : SECTION_META[view];

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
          <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,22rem)] flex-col overflow-hidden border-l border-white/10 bg-slate-950/96 p-5 text-cyan-50 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/45">Cuenta</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{activeSection?.title ?? `${user?.firstName ?? "Usuario"} ${user?.lastName ?? ""}`}</h2>
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

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
              {view === "menu" ? (
                <div className="space-y-3">
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
              ) : view === "profile" ? (
                <ProfilePanel
                  userEmail={user?.email}
                  form={profileForm}
                  setForm={setProfileForm}
                  onBack={goBack}
                  onSave={() => void handleProfileSave()}
                  isSaving={isProfileSaving}
                />
              ) : view === "preferences" ? (
                <PreferencesPanel
                  preferences={preferences}
                  onCurrencyChange={(value) => void handlePreferenceChange("currency", value)}
                  onThemeChange={(value) => void handlePreferenceChange("theme", value)}
                  onLanguageChange={(value) => void handlePreferenceChange("language", value)}
                  onBack={goBack}
                  isSaving={isPreferencesSaving}
                  statusText={
                    preferencesStatus === "saving"
                      ? "Guardando cambios..."
                      : preferencesStatus === "saved"
                        ? "Guardado"
                        : "Los cambios se guardan al instante y actualizan la interfaz."
                  }
                />
              ) : (
                <SecurityPanel
                  form={securityForm}
                  setForm={setSecurityForm}
                  onBack={goBack}
                  onSave={() => void handleSecuritySave()}
                  isSaving={isSecuritySaving}
                />
              )}
            </div>

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
