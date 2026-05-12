"use client";

import { type ComponentType, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { IconBell, IconChevronLeft, IconShieldLock, IconUserCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { UserPreferences } from "@/context/PreferencesContext";

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

export type SecurityFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ThemeMode = "dark" | "light";

type DrawerPanelShellProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  accent: string;
  children: ReactNode;
  footer: ReactNode;
};

function DrawerPanelShell({ icon: Icon, title, description, accent, children, footer }: DrawerPanelShellProps) {
  return (
    <div className={`mt-6 rounded-[1.75rem] border border-[color:var(--border)] bg-gradient-to-br ${accent} p-4 text-[color:var(--foreground)]`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--surface-strong)] text-[color:var(--foreground)]">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-[color:var(--foreground)]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--foreground)]/80">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">{children}</div>

      <div className="mt-4 flex gap-2">{footer}</div>
    </div>
  );
}

type ProfilePanelProps = {
  userEmail?: string | null;
  form: ProfileFormState;
  setForm: Dispatch<SetStateAction<ProfileFormState>>;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  theme: ThemeMode;
};

export function ProfilePanel({ userEmail, form, setForm, onBack, onSave, isSaving, theme }: ProfilePanelProps) {
  return (
    <DrawerPanelShell
      icon={IconUserCircle}
      title="Perfil"
      description="Actualiza nombre, correo y avatar desde un solo lugar."
      accent={theme === "light" ? "from-amber-100/55 to-orange-100/45" : "from-cyan-300/20 to-teal-300/10"}
      footer={
        <>
          <Button variant="secondary" className="flex-1 justify-center" onClick={onBack} disabled={isSaving}>
            <IconChevronLeft size={18} />
            Volver
          </Button>
          <Button className="flex-1 justify-center" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      }
    >
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Nombre</label>
        <Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="Tu nombre" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Apellido</label>
        <Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Tu apellido" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Correo</label>
        <Input value={userEmail ?? ""} disabled />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Avatar URL</label>
        <Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." />
      </div>
      <p className="text-xs text-[color:var(--foreground)]/55">El correo queda solo de lectura por ahora.</p>
    </DrawerPanelShell>
  );
}

type PreferencesPanelProps = {
  preferences: UserPreferences;
  onThemeChange: (value: UserPreferences["theme"]) => void;
  onLanguageChange: (value: UserPreferences["language"]) => void;
  onBack: () => void;
  isSaving: boolean;
  statusText: string;
  theme: ThemeMode;
};

export function PreferencesPanel({
  preferences,
  onThemeChange,
  onLanguageChange,
  onBack,
  isSaving,
  statusText,
  theme,
}: PreferencesPanelProps) {
  return (
    <DrawerPanelShell
      icon={IconBell}
      title="Preferencias"
      description="Configura la apariencia y deja listo el idioma para más adelante. La moneda principal queda fija en CLP por ahora."
      accent={theme === "light" ? "from-amber-100/55 to-rose-100/45" : "from-violet-300/20 to-fuchsia-300/10"}
      footer={
        <Button variant="secondary" className="flex-1 justify-center" onClick={onBack} disabled={isSaving}>
          <IconChevronLeft size={18} />
          Volver
        </Button>
      }
    >
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Tema</label>
        <Select value={preferences.theme} onChange={(event) => onThemeChange(event.target.value as UserPreferences["theme"])} disabled={isSaving}>
          <option value="dark">Oscuro</option>
          <option value="light">Claro</option>
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Idioma</label>
        <Select value={preferences.language} onChange={(event) => onLanguageChange(event.target.value as UserPreferences["language"])} disabled>
          <option value="es">Español</option>
          <option value="en">English</option>
        </Select>
      </div>
      <p className="text-xs text-[color:var(--foreground)]/55">{statusText}</p>
    </DrawerPanelShell>
  );
}

type SecurityPanelProps = {
  form: SecurityFormState;
  setForm: Dispatch<SetStateAction<SecurityFormState>>;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  theme: ThemeMode;
};

export function SecurityPanel({ form, setForm, onBack, onSave, isSaving, theme }: SecurityPanelProps) {
  return (
    <DrawerPanelShell
      icon={IconShieldLock}
      title="Seguridad"
      description="Gestiona contraseña y futuras opciones de sesión."
      accent={theme === "light" ? "from-rose-100/55 to-amber-100/45" : "from-rose-300/20 to-orange-300/10"}
      footer={
        <>
          <Button variant="secondary" className="flex-1 justify-center" onClick={onBack} disabled={isSaving}>
            <IconChevronLeft size={18} />
            Volver
          </Button>
          <Button className="flex-1 justify-center" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Actualizar"}
          </Button>
        </>
      }
    >
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Contraseña actual</label>
        <Input
          type="password"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
          placeholder="Contraseña actual"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Nueva contraseña</label>
        <Input
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
          placeholder="Nueva contraseña"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Confirmar contraseña</label>
        <Input
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          placeholder="Repite la nueva contraseña"
        />
      </div>
      <p className="text-xs text-[color:var(--foreground)]/55">Si tu cuenta es Google-only, primero necesitas configurar una contraseña.</p>
    </DrawerPanelShell>
  );
}
