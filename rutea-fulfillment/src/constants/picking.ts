export type QueueFilter =
  | "today"
  | "available"
  | "modified"
  | "pending_items"
  | "history";

export type LegacyFulfillmentFilterMode =
  | "HOY"
  | "TODAS"
  | "PENDIENTE_LLEGADA";

export type FulfillmentFilterMode = QueueFilter | LegacyFulfillmentFilterMode;

export interface QueueFilterOption {
  id: QueueFilter;
  label: string;
}

export const QUEUE_FILTER_OPTIONS: readonly QueueFilterOption[] = [
  { id: "today", label: "Hoy" },
  { id: "available", label: "Por Alistar" },
  { id: "modified", label: "Con Añadidos" },
  { id: "pending_items", label: "Con Pendientes" },
  { id: "history", label: "Historial Alistadas" },
] as const;

export interface FilterSegmentOption {
  mode: LegacyFulfillmentFilterMode;
  label: string;
}

export const FILTER_SEGMENTS: readonly FilterSegmentOption[] = [
  { mode: "HOY", label: "Hoy" },
  { mode: "TODAS", label: "Disponibles" },
  { mode: "PENDIENTE_LLEGADA", label: "Con Pendientes" },
] as const;

export const EMPTY_QUEUE_DESCRIPTIONS: Record<FulfillmentFilterMode, string> = {
  today: "Aún no se registran facturas del día de hoy pendientes por alistar.",
  available: "Todas las facturas disponibles han sido alistadas.",
  modified:
    "No hay facturas activas con productos añadidos o modificados por facturación.",
  pending_items:
    "Ninguna factura tiene productos marcados como pendientes de llegada.",
  history: "Aún no hay facturas alistadas en el historial de bodega.",
  HOY: "Aún no se registran facturas del día de hoy pendientes por alistar.",
  PENDIENTE_LLEGADA:
    "Ninguna factura tiene productos marcados como pendientes de llegada.",
  TODAS: "Todas las facturas disponibles han sido alistadas.",
};
