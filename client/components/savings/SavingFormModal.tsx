"use client";

import { SavingForm } from "@/components/savings/SavingForm";
import { Modal } from "@/components/ui/Modal";

type SavingFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SavingFormModal({ open, onClose }: SavingFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo ahorro" description="Crea un ahorro fijo o una proyección anual.">
      <SavingForm onSuccess={onClose} />
    </Modal>
  );
}
