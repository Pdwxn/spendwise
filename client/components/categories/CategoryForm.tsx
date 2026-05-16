"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/hooks/useFinance";
import type { HexColor } from "@/types";

const defaultColor = "#0f172a";

type CategoryFormProps = {
  onSuccess?: () => void;
};

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const { actions } = useFinance();
  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState<HexColor>(defaultColor);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedName || !trimmedEmoji) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await actions.addCategory({
        name: trimmedName,
        emoji: trimmedEmoji,
        color,
      });
      toast.success("Categoría creada");

      setName("");
      setEmoji("✨");
      setColor(defaultColor);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la categoría.");
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
          placeholder="Comida, casa, ocio..."
          aria-label="Nombre de la categoría"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Emoji</span>
        <Input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          placeholder="✨"
          aria-label="Emoji de la categoría"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Color</span>
        <Input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value as HexColor)}
          aria-label="Color de la categoría"
          className="h-12 p-1"
        />
      </label>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Añadiendo categoría..." : "Añadir categoría"}
      </Button>
    </form>
  );
}
