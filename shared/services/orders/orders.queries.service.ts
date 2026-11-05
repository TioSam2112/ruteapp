import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Order } from "../../types/order";
import { ORDERS_COLLECTION, mapOrderDoc } from "./orders.helpers";

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

export function subscribeToFulfillmentOrders(
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("estado", "in", [
      "PENDIENTE_ALISTAMIENTO",
      "EN_ALISTAMIENTO",
      "ALISTADO",
      "LISTO_PARA_REPARTO",
    ])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs
        .map((d) => mapOrderDoc(d.id, d.data()))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      callback(orders);
    },
    (err) => onError?.(err)
  );
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
