"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Edit3 } from "lucide-react";
import { ClientForm } from "@/components/admin/clients/ClientForm";
import { useEscapeKey } from "@rutea/shared";
import type { Client } from "@/types/client";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onSuccess?: () => void;
}

export function ClientModal({
  isOpen,
  onClose,
  clientToEdit,
  onSuccess,
}: ClientModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEscapeKey(isOpen, onClose);

  if (!mounted || !isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {clientToEdit ? (
                <Edit3 size={18} strokeWidth={2} />
              ) : (
                <UserPlus size={18} strokeWidth={2} />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {clientToEdit
                  ? "Modifica los datos de contacto, establecimiento y dirección."
                  : "Registra un nuevo comercio o cliente para rutas de entrega."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          <ClientForm
            clientToEdit={clientToEdit}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
