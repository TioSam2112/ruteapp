"use client";

import { useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { formatPosCurrency, useEscapeKey, type Order } from "@rutea/shared";
import { ReadOnlyInvoiceItemsList } from "@/components/admin/dispatch/ReadOnlyInvoiceItemsList";
import { DEFAULT_UNSPECIFIED_CITY } from "@/constants/dispatch";
import {
  buildReadOnlyOrderAuditView,
  formatDispatchTimestamp,
} from "@/utils/dispatch";

export interface ReadOnlyInvoiceDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function ReadOnlyInvoiceDetailModal({
  order,
  onClose,
}: ReadOnlyInvoiceDetailModalProps) {
  useEscapeKey(Boolean(order), onClose);

  const auditView = useMemo(
    () => (order ? buildReadOnlyOrderAuditView(order) : null),
    [order]
  );

  if (!order || !auditView) return null;

  const ciudad = order.clientData.ciudad?.trim() || DEFAULT_UNSPECIFIED_CITY;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-border/50 bg-background shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/40 bg-card/80 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Factura {order.facturaNumber}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={12} />
                  Lista para Reparto
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Inspección de auditoría (Solo lectura) •{" "}
                {formatDispatchTimestamp(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar inspección"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-card p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Building2
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Cliente / Comercio
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {order.clientData.nombre}
                </p>
                {order.clientData.nit && (
                  <p className="text-xs text-muted-foreground">
                    NIT / CC: {order.clientData.nit}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Población & Dirección
                </p>
                <p className="text-sm font-semibold text-foreground">{ciudad}</p>
                <p className="text-xs text-muted-foreground">
                  {order.clientData.direccion || "Sin dirección registrada"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-foreground">
                  {order.clientData.telefono || "No especificado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Vendedor & Bodega
                </p>
                <p className="text-sm font-medium text-foreground">
                  {order.vendedorNombre || "Preventa"}
                </p>
                {auditView.closedByName && (
                  <p className="text-xs text-muted-foreground">
                    Alistado por: {auditView.closedByName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {order.generalObservation && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-muted/40 px-4 py-3 text-xs">
              <div>
                <span className="font-semibold text-foreground">
                  Observación General:{" "}
                </span>
                <span className="text-muted-foreground">
                  {order.generalObservation}
                </span>
              </div>
              {order.generalObservationChecked && (
                <span className="inline-flex shrink-0 items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} />
                  Verificada en bodega
                </span>
              )}
            </div>
          )}

          <ReadOnlyInvoiceItemsList rows={auditView.rows} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 bg-card/90 px-5 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Total Original
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {formatPosCurrency(auditView.totalOriginal)}
              </p>
            </div>
            {Math.abs(auditView.diferencia) > 0.009 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Diferencia Bodega
                </p>
                <p
                  className={`text-sm font-semibold ${
                    auditView.diferencia < 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {auditView.diferencia > 0 ? "+" : ""}
                  {formatPosCurrency(auditView.diferencia)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Total Final Alistado
              </p>
              <p className="text-lg font-bold tracking-tight text-foreground">
                {formatPosCurrency(auditView.totalAlistado)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cerrar Inspección
          </button>
        </div>
      </div>
    </div>
  );
}

