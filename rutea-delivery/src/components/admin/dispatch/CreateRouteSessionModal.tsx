"use client";

import {
  AlertCircle,
  Check,
  MapPin,
  Sparkles,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  formatPosCurrency,
  getUserFullName,
  getUserInitials,
  useEscapeKey,
} from "@rutea/shared";
import { useCreateRouteSession } from "@/hooks/useCreateRouteSession";
import type { DispatchSelectionSummary } from "@/types/dispatch";

export interface CreateRouteSessionModalProps {
  isOpen: boolean;
  selectionSummary: DispatchSelectionSummary;
  creator: { uid: string; nombre: string };
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}

export function CreateRouteSessionModal({
  isOpen,
  selectionSummary,
  creator,
  onClose,
  onSessionCreated,
}: CreateRouteSessionModalProps) {
  useEscapeKey(isOpen, onClose);

  const {
    deliveryUsers,
    loadingUsers,
    selectedCrewUids,
    nombreRuta,
    setNombreRuta,
    submitting,
    error,
    toggleCrewMember,
    handleSubmit,
  } = useCreateRouteSession({
    isOpen,
    selectionSummary,
    creator,
    onSuccess: onSessionCreated,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border/50 bg-background shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/40 bg-card/80 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Armar y Asignar Sesión de Reparto
              </h2>
              <p className="text-xs text-muted-foreground">
                Configura el nombre de la ruta y asigna la cuadrilla de entrega.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Cerrar"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Resumen del Despacho
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {selectionSummary.totalPoblaciones}{" "}
                  {selectionSummary.totalPoblaciones === 1
                    ? "población"
                    : "poblaciones"}{" "}
                  • {selectionSummary.totalFacturas}{" "}
                  {selectionSummary.totalFacturas === 1
                    ? "factura"
                    : "facturas"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Monto Total Ruta
                </p>
                <p className="text-lg font-bold tracking-tight text-primary">
                  {formatPosCurrency(selectionSummary.totalMontoEsperado)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
              {selectionSummary.selectedGroups.map((group) => (
                <span
                  key={group.ciudad}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  <MapPin size={12} className="text-primary" />
                  <span>{group.ciudad}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.2 text-[10px] text-muted-foreground">
                    {group.totalFacturas}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="route-name-input"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Nombre de la Ruta
              </label>
              <button
                type="button"
                onClick={() =>
                  setNombreRuta(selectionSummary.suggestedRouteName)
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Sparkles size={12} />
                Usar sugerido
              </button>
            </div>
            <input
              id="route-name-input"
              type="text"
              value={nombreRuta}
              onChange={(e) => setNombreRuta(e.target.value)}
              placeholder={selectionSummary.suggestedRouteName}
              className="min-h-[44px] w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Users size={14} />
                Cuadrilla de Entregadores ({selectedCrewUids.size} seleccionados)
              </span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
              </div>
            ) : deliveryUsers.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card p-4 text-center text-xs text-muted-foreground">
                No hay usuarios activos con rol &ldquo;delivery&rdquo;. Créalos
                en Usuarios &amp; Roles.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {deliveryUsers.map((user) => {
                  const isSelected = selectedCrewUids.has(user.uid);
                  const fullName = getUserFullName(user);
                  return (
                    <button
                      key={user.uid}
                      type="button"
                      onClick={() => toggleCrewMember(user.uid)}
                      className={`flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/50 bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {getUserInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {fullName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/40 bg-card/90 px-5 py-4 backdrop-blur-md">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting || selectedCrewUids.size === 0}
            onClick={handleSubmit}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Truck size={16} />
            <span>
              {submitting
                ? "Asignando Ruta..."
                : "Crear y Asignar Sesión de Reparto"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

