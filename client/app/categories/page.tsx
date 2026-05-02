"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { CategoryList } from "@/components/categories/CategoryList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Organiza tus categorías con nombre, emoji y color."
        action={
          <Button type="button" onClick={() => setIsOpen(true)}>
            Nueva categoría
          </Button>
        }
      />

      <section>
        <CategoryList />
      </section>

      <CategoryFormModal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
