"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  Building2,
  CheckCircle2,
  PackageCheck,
  Truck,
  Warehouse,
  Scale,
  PackageX,
  MessageSquareWarning,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { formatPosCurrency, type Order } from "@rutea/shared";
import {
  buildOrderReliquidationComparison,
  formatSellerOrderTime,
  getSellerOrderStatusMeta,
  type SellerOrderStatusMeta,
} from "@/utils/reliquidation";

interface SellerInvoiceCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
}

function getStatusBadgeClasses(tone: SellerOrderStatusMeta["tone"]): string {
  switch (tone) {
    case "ready":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    case "picking":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    case "delivery":
      return "border-primary/30 bg-primary/10 text-primary";
    case "cancelled":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "warehouse":
    default:
      return "border-border bg-accent text-muted-foreground";
  }
}

function StatusIcon({ tone }: { tone: SellerOrderStatusMeta["tone"] }) {
  if (tone === "ready") return <PackageCheck size={12} className="shrink-0" />;
  if (tone === "delivery") return <Truck size={12} className="shrink-0" />;
  return <Warehouse size={12} className="shrink-0" />;
}

export function SellerInvoiceCard({ order, isSelected, onSelect }: SellerInvoiceCardProps) {
  const router = useRouter();
  const statusMeta = getSellerOrderStatusMeta(order.estado);
  const comparison = buildOrderReliquidationComparison(order);
  const isAlistadaOrLater =
    order.estado === "ALISTADO" ||
    order.estado === "LISTO_PARA_REPARTO" ||
    order.estado === "EN_RUTA" ||
    order.estado === "ENTREGADO";
  const canEditOrder =
    order.estado === "PENDIENTE_ALISTAMIENTO" ||
    order.estado === "EN_ALISTAMIENTO" ||
    order.estado === "ALISTADO";

  const modifiedCount = comparison.modifiedItems.length;
  const agotadosCount = comparison.agotadosItems.length;
  const notesCount = comparison.itemsWithNotes.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(order)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(order);
        }
      }}
      className={`group flex w-full cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-150 ${
        isSelected
          ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-sm"
          : "border-border/60 bg-card hover:border-primary/40 hover:shadow-xs"
      }`}
    >
      <div className="space-y-2 w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground">
              #{order.facturaNumber}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={11} />
              {formatSellerOrderTime(order.createdAt)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClasses(
              statusMeta.tone
            )}`}
          >
            <StatusIcon tone={statusMeta.tone} />
            <span>{statusMeta.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <Building2 size={14} className="shrink-0 text-muted-foreground" />
          <p className="truncate text-sm font-semibold text-foreground">
            {order.clientData.nombre}
          </p>
        </div>

        {isAlistadaOrLater ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {!comparison.hasChanges ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 size={11} />
                <span>Alistada sin diferencias</span>
              </span>
            ) : (
              <>
                {modifiedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    <Scale size={11} />
                    <span>
                      {modifiedCount}{" "}
                      {modifiedCount === 1 ? "ajuste de peso/cant." : "ajustes de peso/cant."}
                    </span>
                  </span>
                )}
                {agotadosCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    <PackageX size={11} />
                    <span>
                      {agotadosCount} {agotadosCount === 1 ? "agotado" : "agotados"}
                    </span>
                  </span>
                )}
              </>
            )}

            {notesCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-accent px-2 py-0.5 text-[11px] font-medium text-foreground">
                <MessageSquareWarning size={11} />
                <span>
                  {notesCount} {notesCount === 1 ? "nota" : "notas"}
                </span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${order.pickingProgress ?? 0}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {order.pickingProgress ?? 0}% alistado
            </span>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between border-t border-border/40 pt-2.5 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-mono text-sm font-bold text-foreground">
            {formatPosCurrency(
              isAlistadaOrLater ? comparison.pickedVersion.total : comparison.initialVersion.total
            )}
          </span>
          {isAlistadaOrLater && comparison.hasChanges && (
            <span className="font-mono text-[11px] text-muted-foreground line-through">
              {formatPosCurrency(comparison.initialVersion.total)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canEditOrder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/facturation?editOrderId=${order.id}`);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <Edit3 size={12} className="text-primary" />
              <span>Editar / Añadir</span>
            </button>
          )}
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>Revisar</span>
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
