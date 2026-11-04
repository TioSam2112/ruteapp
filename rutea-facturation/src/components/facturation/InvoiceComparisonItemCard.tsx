import { CornerDownRight, MessageSquareWarning, UserCheck } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import { InvoiceItemChangeBadge } from "@/components/facturation/InvoiceItemChangeBadge";
import type { InspectionViewMode } from "@/types/invoice-comparison";
import { formatAuditBadgeCopy } from "@/utils/audit-format";
import { formatQuantityValue } from "@/utils/reliquidation";
import type { OrderItemComparison } from "@/utils/reliquidation";

interface InvoiceComparisonItemCardProps {
  item: OrderItemComparison;
  viewMode: InspectionViewMode;
}

export function InvoiceComparisonItemCard({ item, viewMode }: InvoiceComparisonItemCardProps) {
  const auditCopy = formatAuditBadgeCopy(item.picked.lastPickedBy);

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors ${
        item.changeType === "AGOTADO"
          ? "border-destructive/30 bg-destructive/[0.03]"
          : item.hasDiscrepancy
            ? "border-amber-500/35 bg-amber-500/[0.03]"
            : "border-border/60 bg-card"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                {item.sku}
              </span>
              <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {item.unidadMedida}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatPosCurrency(item.precioUnitario)} c/u
              </span>
            </div>

            <h4
              className={`mt-1 text-sm font-semibold ${
                item.changeType === "AGOTADO" && viewMode === "ALISTADA"
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {item.nombre}
            </h4>

            {item.observationItem && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-lg border border-primary/15 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-medium uppercase text-primary">
                <CornerDownRight size={11} className="shrink-0" />
                <span>Obs. Preventa: {item.observationItem}</span>
              </div>
            )}
          </div>

          {viewMode !== "INICIAL" && <InvoiceItemChangeBadge item={item} />}
        </div>

        {viewMode === "COMPARATIVO" && (
          <div className="grid grid-cols-1 gap-2.5 border-t border-border/40 pt-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-accent/30 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pedido Inicial (Preventa)
              </span>
              <div className="mt-1 flex items-baseline justify-between font-mono">
                <span className="text-xs font-semibold text-foreground">
                  {formatQuantityValue(item.initial.cantidad)} {item.unidadMedida}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {formatPosCurrency(item.initial.subtotal)}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border px-3 py-2 ${
                item.changeType === "AGOTADO"
                  ? "border-destructive/30 bg-destructive/10"
                  : item.hasDiscrepancy
                    ? "border-amber-500/35 bg-amber-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Real Alistado (Bodega)
              </span>
              <div className="mt-1 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-foreground">
                  {formatQuantityValue(item.picked.cantidadAlistada)} {item.unidadMedida}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {formatPosCurrency(item.picked.subtotalAlistado)}
                </span>
              </div>
            </div>
          </div>
        )}

        {viewMode === "INICIAL" && (
          <div className="flex items-center justify-between border-t border-border/40 pt-2.5 font-mono text-xs">
            <span className="text-muted-foreground">
              Cantidad facturada:{" "}
              <strong className="text-foreground">
                {formatQuantityValue(item.initial.cantidad)} {item.unidadMedida}
              </strong>
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatPosCurrency(item.initial.subtotal)}
            </span>
          </div>
        )}

        {viewMode === "ALISTADA" && (
          <div className="flex items-center justify-between border-t border-border/40 pt-2.5 font-mono text-xs">
            <span className="text-muted-foreground">
              Cantidad alistada:{" "}
              <strong className="text-foreground">
                {formatQuantityValue(item.picked.cantidadAlistada)} {item.unidadMedida}
              </strong>
            </span>
            <span className="text-sm font-bold text-primary">
              {formatPosCurrency(item.picked.subtotalAlistado)}
            </span>
          </div>
        )}

        {viewMode !== "INICIAL" && (item.picked.pickerNote || auditCopy) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/30 pt-2 text-xs">
            {item.picked.pickerNote ? (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800">
                <MessageSquareWarning size={13} className="shrink-0" />
                <span>Nota Alistador: {item.picked.pickerNote}</span>
              </div>
            ) : (
              <span />
            )}

            {auditCopy && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <UserCheck size={12} />
                <span>Alistado por {auditCopy}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

