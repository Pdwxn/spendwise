"use client";

import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Modal } from "@/components/ui/Modal";

type ExpenseFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ExpenseFormModal({ open, onClose }: ExpenseFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo gasto" description="Registra un gasto con categoría y fecha.">
      <TransactionForm mode="expense" onSuccess={onClose} />
    </Modal>
  );
}
