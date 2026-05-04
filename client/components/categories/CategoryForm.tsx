"use client";

import type { FormEvent } from "react";
import { useState } from "react";
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
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState<HexColor>(defaultColor);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedName || !trimmedEmoji) {
      return;
    }

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
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Nombre</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Comida, casa, ocio..."
          aria-label="Nombre de la categoría"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Emoji</span>
        <Input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          placeholder="✨"
          aria-label="Emoji de la categoría"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Color</span>
        <Input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value as HexColor)}
          aria-label="Color de la categoría"
          className="h-12 p-1"
        />
      </label>
      <Button type="submit" className="w-full">
        Añadir categoría
      </Button>
    </form>
  );
}
