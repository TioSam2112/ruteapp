"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { UserForm } from "./UserForm";
import { useEscapeKey } from "../../../hooks/useEscapeKey";
import type { UserProfile, UserRole } from "../../../types/auth";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserProfile | null;
  availableRoles?: readonly UserRole[];
  onSuccess?: () => void;
}

export function UserModal({
  isOpen,
  onClose,
  userToEdit,
  availableRoles,
  onSuccess,
}: UserModalProps) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 sm:p-7"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {userToEdit ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {userToEdit
                ? "Modifica los datos personales y rol del usuario."
                : "Ingresa los datos para registrar un nuevo integrante."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <UserForm
          userToEdit={userToEdit}
          availableRoles={availableRoles}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>,
    document.body
  );
}
