export type DeliverySessionStatus = "ASIGNADA" | "EN_CURSO" | "LIQUIDADA";

export interface DeliveryCrewMember {
  uid: string;
  nombre: string;
  email?: string;
}

export interface DeliverySession {
  id: string;
  sessionCode: string;
  nombreRuta: string;
  fecha: string;
  poblaciones: string[];
  assignedCrew: DeliveryCrewMember[];
  orderIds: string[];
  totalFacturas: number;
  totalMontoEsperado: number;
  estado: DeliverySessionStatus;
  createdAt: string;
  createdBy: { uid: string; nombre: string };
  updatedAt?: string;
}

export interface CreateDeliverySessionPayload {
  nombreRuta: string;
  poblaciones: string[];
  assignedCrew: DeliveryCrewMember[];
  orders: Array<{ id: string; totalAlistado: number }>;
}

