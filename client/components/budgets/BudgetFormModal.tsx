"use client";

import { BudgetForm } from "@/components/budgets/BudgetForm";
import { Modal } from "@/components/ui/Modal";

type BudgetFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BudgetFormModal({ open, onClose }: BudgetFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo presupuesto" description="Asigna un importe mensual a una categoría.">
      <BudgetForm onSuccess={onClose} />
    </Modal>
  );
}
