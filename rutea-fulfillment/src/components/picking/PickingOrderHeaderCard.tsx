import type { ReactNode } from "react";
import {
  Check,
  MapPin,
  Phone,
  Building2,
  Hash,
  Navigation,
  UserCheck,
  AlertTriangle,
  FilePlus2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { Order } from "@rutea/shared";
import {
  formatOrderArrivalTime,
  formatPickingAuditTrail,
} from "@/utils/fulfillment";

export interface PickingOrderHeaderCardProps {
  order: Order;
  ciudadLabel: string;
  isTogglingObs: boolean;
  readOnly?: boolean;
  onToggleGeneralObservation: () => void;
}

interface OrderMetadataFieldProps {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  valueClassName: string;
  children: ReactNode;
}

function OrderMetadataField({
  icon: Icon,
  label,
  iconClassName = "text-muted-foreground",
  valueClassName,
  children,
}: OrderMetadataFieldProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card shadow-2xs ${iconClassName}`}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={valueClassName}>{children}</p>
      </div>
    </div>
  );
}

export function PickingOrderHeaderCard({
  order,
  ciudadLabel,
  isTogglingObs,
  readOnly = false,
  onToggleGeneralObservation,
}: PickingOrderHeaderCardProps) {
  const hasGeneralObservation = Boolean(order.generalObservation?.trim());
  const isGeneralObsChecked = Boolean(order.generalObservationChecked);
  const generalObsAuditText = formatPickingAuditTrail(
    order.generalObservationAudit,
    isGeneralObsChecked
  );
  const vendedorLabel = order.vendedorNombre?.trim() || "Preventa";
  const showSellerEditBanner = Boolean(
    order.hasPostPickingAdditions || order.lastSellerEdit
  );

  return (
    <section
      aria-label="Metadatos del pedido"
      className="rounded-2xl border border-border/60 bg-accent/60 p-4 sm:p-5"
    >
      {showSellerEditBanner && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
            <FilePlus2 size={15} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">
                Factura actualizada desde facturación
              </p>
              {order.lastSellerEdit?.timestamp && (
                <span className="font-mono text-[11px] font-medium text-muted-foreground">
                  {formatOrderArrivalTime(order.lastSellerEdit.timestamp)}
                </span>
              )}
            </div>
            <p className="leading-relaxed text-muted-foreground">
              {order.lastSellerEdit?.summary ||
                "Se registraron productos añadidos o cantidades modificadas pendientes de alistamiento."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <OrderMetadataField
          icon={Building2}
          label="Cliente / Comercio"
          iconClassName="text-primary"
          valueClassName="truncate text-sm font-semibold text-foreground"
        >
          {order.clientData.nombre}
        </OrderMetadataField>
        <OrderMetadataField
          icon={Hash}
          label="NIT / Identificación"
          valueClassName="truncate font-mono text-sm font-medium text-foreground"
        >
          {order.clientData.nit?.trim() || "No especificado"}
        </OrderMetadataField>
        <OrderMetadataField
          icon={Phone}
          label="Teléfono"
          valueClassName="truncate font-mono text-sm font-medium text-foreground"
        >
          {order.clientData.telefono?.trim() || "No registrado"}
        </OrderMetadataField>
        <OrderMetadataField
          icon={Navigation}
          label="Dirección de entrega"
          valueClassName="text-sm font-medium text-foreground"
        >
          {order.clientData.direccion?.trim() || "Sin dirección"}
        </OrderMetadataField>
        <OrderMetadataField
          icon={MapPin}
          label="Ciudad / Población"
          valueClassName="truncate text-sm font-semibold text-foreground"
        >
          {ciudadLabel}
        </OrderMetadataField>
        <OrderMetadataField
          icon={UserCheck}
          label="Vendedor / Facturador"
          valueClassName="truncate text-sm font-medium text-foreground"
        >
          {vendedorLabel}{" "}
          <span className="text-xs text-muted-foreground">
            ({formatOrderArrivalTime(order.createdAt)})
          </span>
        </OrderMetadataField>
      </div>

      {hasGeneralObservation && (
        <div
          className={`mt-4 flex items-start justify-between gap-3 rounded-2xl border p-4 transition-colors duration-150 ${
            isGeneralObsChecked
              ? "border-emerald-500/35 bg-card"
              : "border-amber-500/40 bg-amber-500/[0.08]"
          }`}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle
                size={14}
                className={
                  isGeneralObsChecked ? "shrink-0 text-emerald-600" : "shrink-0 text-amber-600"
                }
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Observación General de la Factura
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {order.generalObservation}
            </p>
            {generalObsAuditText && (
              <p className="pt-1 text-[11px] text-muted-foreground">{generalObsAuditText}</p>
            )}
          </div>

          <button
            type="button"
            role="checkbox"
            aria-checked={isGeneralObsChecked}
            aria-label="Confirmar revisión de observación general"
            onClick={onToggleGeneralObservation}
            disabled={isTogglingObs || readOnly}
            className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition-all duration-150 active:scale-[0.95] disabled:opacity-60 ${
              isGeneralObsChecked
                ? "border-emerald-600 bg-emerald-500 text-white shadow-xs"
                : "border-amber-500/50 bg-card text-muted-foreground hover:border-amber-500 hover:text-foreground"
            }`}
          >
            {isTogglingObs ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check
                size={20}
                strokeWidth={2.6}
                className={isGeneralObsChecked ? "opacity-100" : "opacity-25"}
              />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
