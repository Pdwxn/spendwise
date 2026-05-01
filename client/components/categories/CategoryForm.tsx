"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/hooks/useFinance";
import type { HexColor } from "@/types";

const defaultColor = "#0f172a";

export function CategoryForm() {
  const { actions } = useFinance();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState<HexColor>(defaultColor);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedName || !trimmedEmoji) {
      return;
    }

    actions.addCategory({
      name: trimmedName,
      emoji: trimmedEmoji,
      color,
    });

    setName("");
    setEmoji("✨");
    setColor(defaultColor);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">New category</h2>
        <p className="text-sm text-slate-500">Create a category with name, emoji, and color.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Category name"
          aria-label="Category name"
        />
        <Input
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
          placeholder="Emoji"
          aria-label="Category emoji"
        />
        <Input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value as HexColor)}
          aria-label="Category color"
          className="h-12 p-1"
        />
        <Button type="submit" className="w-full">
          Add category
        </Button>
      </form>
    </Card>
  );
}
