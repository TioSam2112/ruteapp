import type { DeliverySessionStatus, ItemPickingStatus } from "@rutea/shared";
import type { DispatchTabMode } from "@/types/dispatch";

export const DEFAULT_UNSPECIFIED_CITY = "Sin población especificada";

export interface DispatchTabOption {
  id: DispatchTabMode;
  label: string;
}

export const DISPATCH_TAB_OPTIONS: readonly DispatchTabOption[] = [
  { id: "POR_DESPACHAR", label: "Facturas Listas por Población" },
  { id: "RUTAS_ACTIVAS", label: "Rutas Asignadas / En Curso" },
] as const;

export const SESSION_STATUS_META: Record<
  DeliverySessionStatus,
  { label: string; className: string }
> = {
  ASIGNADA: {
    label: "Asignada",
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  EN_CURSO: {
    label: "En Curso",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  LIQUIDADA: {
    label: "Liquidada",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

export const ITEM_PICKING_STATUS_META: Record<
  ItemPickingStatus,
  { label: string; className: string }
> = {
  ALISTADO: {
    label: "Alistado",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  AGOTADO: {
    label: "Agotado",
    className: "border-destructive/25 bg-destructive/10 text-destructive",
  },
  PENDIENTE_LLEGADA: {
    label: "Pendiente llegada",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  PENDIENTE_REVISION: {
    label: "Por revisar",
    className: "border-border bg-muted text-muted-foreground",
  },
};

