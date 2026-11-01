export type ItemPickingStatus =
  | "PENDIENTE_REVISION"
  | "ALISTADO"
  | "PENDIENTE_LLEGADA"
  | "AGOTADO";

export interface PickingAuditLog {
  uid: string;
  userName: string;
  action:
    | ItemPickingStatus
    | "NOTA_EDITADA"
    | "CANTIDAD_AJUSTADA"
    | "OBS_GENERAL_CHECK";
  timestamp: string;
}

export interface PickingAuditUser {
  uid: string;
  userName: string;
}

export interface OrderItemPickingPatch {
  pickingStatus?: ItemPickingStatus;
  cantidadAlistada?: number;
  pickerNote?: string;
  action?: PickingAuditLog["action"];
}

export interface OrderItem {
  id_producto: string;
  sku: string;
  nombre: string;
  precioVentaAtSale: number;
  cantidad: number;
  unidadMedida: string;
  observationItem?: string;
  subtotal: number;
  pickingStatus?: ItemPickingStatus;
  cantidadAlistada?: number;
  pickerNote?: string;
  lastPickedBy?: PickingAuditLog;
}

export interface ClientOrderData {
  nombre: string;
  nit?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
}

export type OrderStatus =
  | "PENDIENTE_ALISTAMIENTO"
  | "EN_ALISTAMIENTO"
  | "ALISTADO"
  | "EN_RUTA"
  | "ENTREGADO"
  | "CANCELADO";

export interface Order {
  id: string;
  facturaNumber: string;
  id_cliente: string;
  clientData: ClientOrderData;
  id_vendedor: string;
  vendedorNombre?: string;
  items: OrderItem[];
  generalObservation?: string;
  generalObservationChecked?: boolean;
  generalObservationAudit?: PickingAuditLog;
  pickingProgress?: number;
  totalBase: number;
  totalTax: number;
  total: number;
  estado: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderData = Omit<Order, "id" | "createdAt" | "updatedAt">;
