import type { Order } from "@rutea/shared";

export type DeliveryPaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "CREDITO";

export interface DeliveryCrewDisplayMember {
  uid: string;
  nombre: string;
  initials: string;
  isCurrentUser: boolean;
  email?: string;
}

export interface DeliveryRouteProgress {
  totalFacturas: number;
  entregadasCount: number;
  pendientesCount: number;
  progressPercent: number;
  totalMontoEsperado: number;
  montoRecaudado: number;
  montoPendiente: number;
}

export interface AssignedCityInvoiceGroup {
  ciudad: string;
  orders: Order[];
  totalFacturas: number;
  entregadasCount: number;
  pendientesCount: number;
  totalMontoEsperado: number;
}

