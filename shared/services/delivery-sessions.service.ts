import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order } from "../types/order";
import type {
  CreateDeliverySessionPayload,
  DeliveryCrewMember,
  DeliverySession,
  DeliverySessionStatus,
} from "../types/delivery-session";
import {
  ORDERS_COLLECTION,
  mapOrderDoc,
  roundCurrency,
} from "./orders/orders.helpers";

export const DELIVERY_SESSIONS_COLLECTION = "delivery_sessions";

function mapDeliverySessionDoc(id: string, data: unknown): DeliverySession {
  return { id, ...(data as Omit<DeliverySession, "id">) };
}

function getLocalDateParts(date: Date = new Date()): {
  fecha: string;
  compactDate: string;
} {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return {
    fecha: `${year}-${month}-${day}`,
    compactDate: `${year}${month}${day}`,
  };
}

function sanitizeCrewMember(member: DeliveryCrewMember): DeliveryCrewMember {
  const trimmedEmail = member.email?.trim();
  return {
    uid: member.uid,
    nombre: member.nombre.trim(),
    ...(trimmedEmail ? { email: trimmedEmail } : {}),
  };
}

async function generateDeliverySessionCode(
  fecha: string,
  compactDate: string
): Promise<string> {
  try {
    const q = query(
      collection(db, DELIVERY_SESSIONS_COLLECTION),
      where("fecha", "==", fecha)
    );
    const snapshot = await getDocs(q);
    const nextSequence = String(snapshot.size + 1).padStart(2, "0");
    return `RUTA-${compactDate}-${nextSequence}`;
  } catch {
    const fallbackSuffix = Date.now().toString().slice(-4);
    return `RUTA-${compactDate}-${fallbackSuffix}`;
  }
}

export function subscribeToReadyOrders(
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("estado", "==", "LISTO_PARA_REPARTO")
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

export async function createDeliverySession(
  payload: CreateDeliverySessionPayload,
  creator: { uid: string; nombre: string }
): Promise<string> {
  const now = new Date().toISOString();
  const { fecha, compactDate } = getLocalDateParts();
  const sessionCode = await generateDeliverySessionCode(fecha, compactDate);

  const sessionRef = doc(collection(db, DELIVERY_SESSIONS_COLLECTION));
  const orderIds = payload.orders.map((o) => o.id);
  const totalFacturas = payload.orders.length;
  const totalMontoEsperado = roundCurrency(
    payload.orders.reduce((acc, o) => acc + Number(o.totalAlistado || 0), 0)
  );

  const sessionData: Omit<DeliverySession, "id"> = {
    sessionCode,
    nombreRuta: payload.nombreRuta.trim(),
    fecha,
    poblaciones: Array.from(new Set(payload.poblaciones.map((p) => p.trim()).filter(Boolean))),
    assignedCrew: payload.assignedCrew.map(sanitizeCrewMember),
    orderIds,
    totalFacturas,
    totalMontoEsperado,
    estado: "ASIGNADA",
    createdAt: now,
    createdBy: {
      uid: creator.uid,
      nombre: creator.nombre.trim(),
    },
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(sessionRef, sessionData);

  for (const order of payload.orders) {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    batch.update(orderRef, {
      deliverySessionId: sessionRef.id,
      deliverySessionCode: sessionCode,
      estado: "EN_RUTA",
      updatedAt: now,
    });
  }

  await batch.commit();
  return sessionRef.id;
}

export function subscribeToActiveSessions(
  callback: (sessions: DeliverySession[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, DELIVERY_SESSIONS_COLLECTION),
    where("estado", "in", ["ASIGNADA", "EN_CURSO"])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs
        .map((d) => mapDeliverySessionDoc(d.id, d.data()))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      callback(sessions);
    },
    (err) => onError?.(err)
  );
}

export function subscribeToUserDeliverySession(
  deliveryUid: string,
  callback: (session: DeliverySession | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, DELIVERY_SESSIONS_COLLECTION),
    where("estado", "in", ["ASIGNADA", "EN_CURSO"])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const matchingSessions = snapshot.docs
        .map((d) => mapDeliverySessionDoc(d.id, d.data()))
        .filter((session) =>
          session.assignedCrew.some((member) => member.uid === deliveryUid)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      callback(matchingSessions[0] ?? null);
    },
    (err) => onError?.(err)
  );
}

export function subscribeToSessionOrders(
  sessionId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("deliverySessionId", "==", sessionId)
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

export async function updateDeliverySessionStatus(
  sessionId: string,
  estado: DeliverySessionStatus
): Promise<void> {
  const sessionRef = doc(db, DELIVERY_SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    estado,
    updatedAt: new Date().toISOString(),
  });
}


