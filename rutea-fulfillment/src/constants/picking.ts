import type { FulfillmentFilterMode } from "@/utils/fulfillment";

export interface FilterSegmentOption {
  mode: FulfillmentFilterMode;
  label: string;
}

export const FILTER_SEGMENTS: readonly FilterSegmentOption[] = [
  { mode: "HOY", label: "Hoy" },
  { mode: "TODAS", label: "Disponibles" },
  { mode: "PENDIENTE_LLEGADA", label: "Con Pendientes" },
] as const;

export const EMPTY_QUEUE_DESCRIPTIONS: Record<FulfillmentFilterMode, string> = {
  HOY: "Aún no se registran facturas del día de hoy pendientes por alistar.",
  PENDIENTE_LLEGADA:
    "Ninguna factura tiene productos marcados como pendientes de llegada.",
  TODAS: "Todas las facturas disponibles han sido alistadas.",
};
