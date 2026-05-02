"use client";

import { AccountForm } from "@/components/accounts/AccountForm";
import { Modal } from "@/components/ui/Modal";

type AccountFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AccountFormModal({ open, onClose }: AccountFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nueva cuenta" description="Define nombre, saldo inicial y color.">
      <AccountForm onSuccess={onClose} />
    </Modal>
  );
}
