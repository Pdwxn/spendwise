"use client";

import { CategoryForm } from "@/components/categories/CategoryForm";
import { Modal } from "@/components/ui/Modal";

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CategoryFormModal({ open, onClose }: CategoryFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nueva categoría" description="Crea una categoría con nombre, emoji y color.">
      <CategoryForm onSuccess={onClose} />
    </Modal>
  );
}
