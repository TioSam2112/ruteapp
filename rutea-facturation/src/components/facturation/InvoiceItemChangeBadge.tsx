import { PackageX, Scale, Clock, CheckCircle2 } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import { formatQuantityValue } from "@/utils/reliquidation";
import type { OrderItemComparison } from "@/utils/reliquidation";

export function InvoiceItemChangeBadge({ item }: { item: OrderItemComparison }) {
  switch (item.changeType) {
    case "AGOTADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
          <PackageX size={12} />
          <span>Agotado en bodega (0 {item.unidadMedida})</span>
        </span>
      );
    case "CANTIDAD_REDUCIDA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          <Scale size={12} />
          <span>
            Ajuste: {formatQuantityValue(item.deltaCantidad)} {item.unidadMedida} (
            {formatPosCurrency(item.deltaSubtotal)})
          </span>
        </span>
      );
    case "CANTIDAD_AUMENTADA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <Scale size={12} />
          <span>
            Ajuste: +{formatQuantityValue(item.deltaCantidad)} {item.unidadMedida} (+
            {formatPosCurrency(item.deltaSubtotal)})
          </span>
        </span>
      );
    case "PENDIENTE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Clock size={12} />
          <span>En revisión de bodega</span>
        </span>
      );
    case "SIN_CAMBIO":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 size={12} />
          <span>Alistado completo</span>
        </span>
      );
  }
}

