import {
  Clock,
  FileText,
  ChevronRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import type { Order } from "@rutea/shared";
import { getOrderQueueCardSummary } from "@/utils/fulfillment";

export interface InvoiceQueueCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
}

export function InvoiceQueueCard({
  order,
  isSelected,
  onSelect,
}: InvoiceQueueCardProps) {
  const summary = getOrderQueueCardSummary(order);

  const statusBadgeClasses =
    summary.statusMeta.tone === "in_progress"
      ? "border-primary/25 bg-primary/10 text-primary"
      : summary.statusMeta.tone === "completed"
        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
        : "border-border bg-accent/70 text-muted-foreground";

  const progressFillClasses =
    summary.stats.progressPercentage === 100
      ? "bg-emerald-500"
      : summary.hasPendingArrival
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={`group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.985] ${
        isSelected
          ? "border-primary bg-primary/[0.03] shadow-xs ring-2 ring-primary/15"
          : "border-border/70 bg-card shadow-2xs hover:border-border hover:bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-accent/80 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-foreground">
            {order.facturaNumber}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Clock size={11.5} className="shrink-0" />
            {summary.arrivalTimeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-tight ${statusBadgeClasses}`}
          >
            {summary.statusMeta.label}
          </span>
          <ChevronRight
            size={15}
            className={`transition-transform duration-150 ${
              isSelected
                ? "translate-x-0.5 text-primary"
                : "text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-foreground"
            }`}
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
          {order.clientData.nombre}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserCheck size={12.5} className="shrink-0" />
          <span className="truncate">
            Facturó:{" "}
            <strong className="font-medium text-foreground/85">
              {summary.vendedorLabel}
            </strong>
          </span>
        </div>
      </div>

      {(summary.hasGeneralObservation || summary.hasPendingArrival) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.hasPendingArrival && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
              <Clock size={11.5} className="shrink-0" />
              {summary.stats.pendientesLlegadaCount}{" "}
              {summary.stats.pendientesLlegadaCount === 1
                ? "pendiente por llegar"
                : "pendientes por llegar"}
            </span>
          )}

          {summary.hasGeneralObservation && (
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${
                summary.isGeneralObservationChecked
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                  : "border-primary/25 bg-primary/10 text-primary"
              }`}
            >
              {summary.isGeneralObservationChecked ? (
                <CheckCircle2 size={11.5} className="shrink-0" />
              ) : (
                <FileText size={11.5} className="shrink-0" />
              )}
              Observación general
            </span>
          )}
        </div>
      )}

      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            {summary.progressCopy}
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {summary.percentageLabel}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
          <div
            style={{
              width: `${summary.stats.progressPercentage}%`,
            }}
            className={`h-full rounded-full transition-all duration-300 ease-out ${progressFillClasses}`}
          />
        </div>
      </div>
    </button>
  );
}
