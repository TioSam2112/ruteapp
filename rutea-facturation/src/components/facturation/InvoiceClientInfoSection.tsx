import {
  Building2,
  Hash,
  Phone,
  Navigation,
  MapPin,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Order } from "@rutea/shared";
import { formatAuditBadgeCopy } from "@/utils/audit-format";
import type { OrderReliquidationComparison } from "@/utils/reliquidation";

interface InvoiceClientInfoSectionProps {
  order: Order;
  comparison: OrderReliquidationComparison;
  ciudadLabel: string;
}

interface InfoFieldProps {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  valueClassName: string;
  children: React.ReactNode;
}

function InfoField({
  icon: Icon,
  label,
  iconClassName = "text-muted-foreground",
  valueClassName,
  children,
}: InfoFieldProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent ${iconClassName}`}
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

export function InvoiceClientInfoSection({
  order,
  comparison,
  ciudadLabel,
}: InvoiceClientInfoSectionProps) {
  const vendedorLabel = order.vendedorNombre?.trim() || "Preventa";
  const generalObsAuditCopy = formatAuditBadgeCopy(order.generalObservationAudit);
  const isChecked = comparison.generalObservationChecked;

  return (
    <section
      aria-label="Datos del cliente y observación general"
      className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-4"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField
          icon={Building2}
          label="Cliente / Comercio"
          iconClassName="text-primary"
          valueClassName="truncate text-sm font-semibold text-foreground"
        >
          {order.clientData.nombre}
        </InfoField>
        <InfoField
          icon={Hash}
          label="NIT / Identificación"
          valueClassName="truncate font-mono text-sm font-medium text-foreground"
        >
          {order.clientData.nit?.trim() || "No especificado"}
        </InfoField>
        <InfoField
          icon={Phone}
          label="Teléfono"
          valueClassName="truncate font-mono text-sm font-medium text-foreground"
        >
          {order.clientData.telefono?.trim() || "No registrado"}
        </InfoField>
        <InfoField
          icon={Navigation}
          label="Dirección"
          valueClassName="text-sm font-medium text-foreground"
        >
          {order.clientData.direccion?.trim() || "Sin dirección"}
        </InfoField>
        <InfoField
          icon={MapPin}
          label="Población"
          valueClassName="truncate text-sm font-semibold text-foreground"
        >
          {ciudadLabel}
        </InfoField>
        <InfoField
          icon={UserCheck}
          label="Facturador / Cierre"
          valueClassName="truncate text-sm font-medium text-foreground"
        >
          {vendedorLabel}
          {comparison.summary.closedByName && (
            <span className="block text-[11px] text-muted-foreground">
              Cerrado por: {comparison.summary.closedByName}
            </span>
          )}
        </InfoField>
      </div>

      {comparison.generalObservation && (
        <div
          className={`rounded-xl border p-3.5 ${
            isChecked
              ? "border-emerald-500/30 bg-emerald-500/[0.05]"
              : "border-amber-500/35 bg-amber-500/[0.06]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle
                size={14}
                className={isChecked ? "text-emerald-600" : "text-amber-600"}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Observación General de Factura
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                isChecked ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
              }`}
            >
              {isChecked ? (
                <>
                  <CheckCircle2 size={11} />
                  <span>
                    Verificada en bodega
                    {generalObsAuditCopy ? ` (${generalObsAuditCopy})` : ""}
                  </span>
                </>
              ) : (
                <span>Pendiente de check en bodega</span>
              )}
            </span>
          </div>

          <p className="mt-1.5 font-mono text-xs font-medium uppercase text-foreground">
            {comparison.generalObservation}
          </p>
        </div>
      )}
    </section>
  );
}

