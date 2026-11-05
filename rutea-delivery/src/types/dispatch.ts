import type { ItemPickingStatus, Order } from "@rutea/shared";

export type DispatchTabMode = "POR_DESPACHAR" | "RUTAS_ACTIVAS";

export interface CityDispatchGroup {
  ciudad: string;
  orders: Order[];
  totalFacturas: number;
  totalMontoEsperado: number;
}

export interface DispatchSelectionSummary {
  selectedCities: string[];
  selectedGroups: CityDispatchGroup[];
  selectedOrders: Array<{ id: string; totalAlistado: number }>;
  totalPoblaciones: number;
  totalFacturas: number;
  totalMontoEsperado: number;
  suggestedRouteName: string;
}

export interface ReadOnlyItemComparisonRow {
  id_producto: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  precioUnitario: number;
  cantidadOriginal: number;
  cantidadAlistada: number;
  subtotalOriginal: number;
  subtotalAlistado: number;
  deltaCantidad: number;
  status: ItemPickingStatus;
  pickerNote?: string;
  observationItem?: string;
  pickerName?: string;
  pickedAt?: string;
  hasDiscrepancy: boolean;
}

export interface ReadOnlyOrderAuditView {
  totalOriginal: number;
  totalAlistado: number;
  diferencia: number;
  closedByName?: string;
  closedAt?: string;
  rows: ReadOnlyItemComparisonRow[];
}

