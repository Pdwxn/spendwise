"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/hooks/useFinance";
import type { HexColor } from "@/types";

const defaultColor = "#0f172a";

type AccountFormProps = {
  onSuccess?: () => void;
};

export function AccountForm({ onSuccess }: AccountFormProps) {
  const { actions } = useFinance();
  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [color, setColor] = useState<HexColor>(defaultColor);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await actions.addAccount({
        name: trimmedName,
        initialBalance: Number(initialBalance) || 0,
        color,
      });
      toast.success("Cuenta creada");

      setName("");
      setInitialBalance("0");
      setColor(defaultColor);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Nombre</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Cuenta principal"
          aria-label="Nombre de la cuenta"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Saldo inicial</span>
        <Input
          type="number"
          step="0.01"
          value={initialBalance}
          onChange={(event) => setInitialBalance(event.target.value)}
          placeholder="0.00"
          aria-label="Saldo inicial"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Color</span>
        <Input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value as HexColor)}
          aria-label="Color de la cuenta"
          className="h-12 p-1"
        />
      </label>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Añadiendo cuenta..." : "Añadir cuenta"}
      </Button>
    </form>
  );
}
