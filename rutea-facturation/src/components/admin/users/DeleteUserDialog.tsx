"use client";

import { AlertTriangle } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { UserProfile } from "@/types/auth";

interface DeleteUserDialogProps {
  user: UserProfile | null;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({
  user,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeleteUserDialogProps) {
  useEscapeKey(Boolean(user) && !isDeleting, onCancel);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => !isDeleting && onCancel()}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle size={24} strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          ¿Eliminar usuario?
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Esta acción eliminará el registro de{" "}
          <strong className="text-foreground">
            {user.nombre
              ? `${user.nombre} ${user.apellido ?? ""}`
              : user.email}
          </strong>{" "}
          de la base de datos de Firestore. Esta acción no se puede deshacer.
        </p>

        {error && (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-border/80 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-destructive px-3.5 py-2 text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
