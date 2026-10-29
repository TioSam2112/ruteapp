import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CreateOrderData, Order } from "../types/order";

const ORDERS_COLLECTION = "orders";

function mapOrderDoc(id: string, data: unknown): Order {
  return { id, ...(data as Omit<Order, "id">) };
}

export async function generateNextFacturaNumber(): Promise<string> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return "FAC-0001";
    }

    const lastOrder = snapshot.docs[0].data() as Partial<Order>;
    const lastNumberStr = lastOrder.facturaNumber;

    if (lastNumberStr && lastNumberStr.startsWith("FAC-")) {
      const numericPart = parseInt(lastNumberStr.replace("FAC-", ""), 10);
      if (!isNaN(numericPart)) {
        return `FAC-${(numericPart + 1).toString().padStart(4, "0")}`;
      }
    }

    const countSnapshot = await getDocs(ordersRef);
    return `FAC-${(countSnapshot.size + 1).toString().padStart(4, "0")}`;
  } catch {
    return `FAC-${Date.now().toString().slice(-6)}`;
  }
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const newDocRef = doc(collection(db, ORDERS_COLLECTION));
  const now = new Date().toISOString();
  const facturaNumber = data.facturaNumber || (await generateNextFacturaNumber());

  const order: Order = {
    id: newDocRef.id,
    facturaNumber,
    id_cliente: data.id_cliente,
    clientData: {
      nombre: data.clientData.nombre.trim(),
      ...(data.clientData.nit ? { nit: data.clientData.nit.trim() } : {}),
      ...(data.clientData.telefono ? { telefono: data.clientData.telefono.trim() } : {}),
      ...(data.clientData.direccion ? { direccion: data.clientData.direccion.trim() } : {}),
      ...(data.clientData.ciudad ? { ciudad: data.clientData.ciudad.trim() } : {}),
    },
    id_vendedor: data.id_vendedor,
    ...(data.vendedorNombre ? { vendedorNombre: data.vendedorNombre.trim() } : {}),
    items: data.items.map((item) => ({
      id_producto: item.id_producto,
      sku: item.sku,
      nombre: item.nombre,
      precioVentaAtSale: Number(item.precioVentaAtSale),
      cantidad: Number(item.cantidad),
      unidadMedida: item.unidadMedida,
      ...(item.observationItem ? { observationItem: item.observationItem.trim() } : {}),
      subtotal: Number(item.subtotal),
    })),
    ...(data.generalObservation
      ? { generalObservation: data.generalObservation.trim() }
      : {}),
    totalBase: Number(data.totalBase),
    totalTax: Number(data.totalTax),
    total: Number(data.total),
    estado: data.estado || "PENDIENTE_ALISTAMIENTO",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, order);
  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, ORDERS_COLLECTION, id));
  return snapshot.exists() ? mapOrderDoc(snapshot.id, snapshot.data()) : null;
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapOrderDoc(d.id, d.data()));
}

export function subscribeOrders(
  onData: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => mapOrderDoc(d.id, d.data()))),
    (err) => onError?.(err)
  );
}
