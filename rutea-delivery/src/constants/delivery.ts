import type { OrderStatus } from "@rutea/shared";
import type { DeliveryPaymentMethod } from "@/types/delivery";

export const ALL_ROUTE_CITIES_FILTER = "TODAS";

export interface DeliveryPaymentMethodOption {
  id: DeliveryPaymentMethod;
  label: string;
  shortLabel: string;
}

export const DELIVERY_PAYMENT_METHODS: readonly DeliveryPaymentMethodOption[] = [
  { id: "EFECTIVO", label: "Efectivo en Sitio", shortLabel: "Efectivo" },
  { id: "TRANSFERENCIA", label: "Transferencia Bancaria", shortLabel: "Transferencia" },
  { id: "CREDITO", label: "Crédito Autorizado", shortLabel: "Crédito" },
] as const;

export const ROUTE_ORDER_STATUS_META: Partial<
  Record<OrderStatus, { label: string; className: string }>
> = {
  EN_RUTA: {
    label: "En Ruta • Pendiente",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  LISTO_PARA_REPARTO: {
    label: "Lista en Ruta",
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  ENTREGADO: {
    label: "Entregada",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

