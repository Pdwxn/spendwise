"use client";

import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 backdrop-blur-sm sm:items-center sm:p-6"
      style={{ backgroundColor: "color-mix(in srgb, var(--background) 78%, black)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-xl rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-[color:var(--foreground)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
              {title}
            </h2>
            {description ? <p className="text-sm text-[color:var(--foreground)]/65">{description}</p> : null}
          </div>
          <Button variant="ghost" type="button" onClick={onClose} className="h-10 w-10 rounded-full p-0">
            <IconX size={18} />
            <span className="sr-only">Cerrar modal</span>
          </Button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
