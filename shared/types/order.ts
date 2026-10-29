export interface OrderItem {
  id_producto: string;
  sku: string;
  nombre: string;
  precioVentaAtSale: number;
  cantidad: number;
  unidadMedida: string;
  observationItem?: string;
  subtotal: number;
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
  totalBase: number;
  totalTax: number;
  total: number;
  estado: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderData = Omit<Order, "id" | "createdAt" | "updatedAt">;
