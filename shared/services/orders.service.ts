import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  CreateOrderData,
  ItemPickingStatus,
  Order,
  OrderItem,
  OrderItemPickingPatch,
  PickingAuditLog,
  PickingAuditUser,
} from "../types/order";

const ORDERS_COLLECTION = "orders";

function mapOrderDoc(id: string, data: unknown): Order {
  return { id, ...(data as Omit<Order, "id">) };
}

function isItemResolved(status?: ItemPickingStatus): boolean {
  return status === "ALISTADO" || status === "AGOTADO";
}

function computePickingProgress(items: readonly OrderItem[]): number {
  if (items.length === 0) return 0;
  const resolvedCount = items.filter((item) =>
    isItemResolved(item.pickingStatus)
  ).length;
  return Math.round((resolvedCount / items.length) * 100);
}

function sanitizeOrderItem(item: OrderItem): OrderItem {
  const sanitized: OrderItem = {
    id_producto: item.id_producto,
    sku: item.sku,
    nombre: item.nombre,
    precioVentaAtSale: Number(item.precioVentaAtSale),
    cantidad: Number(item.cantidad),
    unidadMedida: item.unidadMedida,
    subtotal: Number(item.subtotal),
  };

  if (item.observationItem !== undefined) {
    sanitized.observationItem = item.observationItem;
  }
  if (item.pickingStatus !== undefined) {
    sanitized.pickingStatus = item.pickingStatus;
  }
  if (item.cantidadAlistada !== undefined) {
    sanitized.cantidadAlistada = Number(item.cantidadAlistada);
  }
  if (item.pickerNote !== undefined) {
    sanitized.pickerNote = item.pickerNote;
  }
  if (item.lastPickedBy !== undefined) {
    sanitized.lastPickedBy = item.lastPickedBy;
  }

  return sanitized;
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

export function subscribeToFulfillmentOrders(
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("estado", "in", ["PENDIENTE_ALISTAMIENTO", "EN_ALISTAMIENTO"])
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

export async function updateOrderItemPicking(
  orderId: string,
  itemIndex: number,
  updatedItemPatch: OrderItemPickingPatch,
  auditUser: PickingAuditUser
): Promise<Order> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`La orden con ID "${orderId}" no existe.`);
  }

  const order = mapOrderDoc(snapshot.id, snapshot.data());

  if (itemIndex < 0 || itemIndex >= order.items.length) {
    throw new Error(
      `El índice de ítem ${itemIndex} está fuera de rango para la orden "${orderId}".`
    );
  }

  const now = new Date().toISOString();
  const currentItem = order.items[itemIndex];

  let resolvedAction: PickingAuditLog["action"];
  if (updatedItemPatch.action) {
    resolvedAction = updatedItemPatch.action;
  } else if (
    updatedItemPatch.pickingStatus !== undefined &&
    updatedItemPatch.pickingStatus !== currentItem.pickingStatus
  ) {
    resolvedAction = updatedItemPatch.pickingStatus;
  } else if (
    updatedItemPatch.cantidadAlistada !== undefined &&
    updatedItemPatch.cantidadAlistada !== currentItem.cantidadAlistada
  ) {
    resolvedAction = "CANTIDAD_AJUSTADA";
  } else if (
    updatedItemPatch.pickerNote !== undefined &&
    updatedItemPatch.pickerNote !== currentItem.pickerNote
  ) {
    resolvedAction = "NOTA_EDITADA";
  } else {
    resolvedAction =
      updatedItemPatch.pickingStatus ??
      currentItem.pickingStatus ??
      "PENDIENTE_REVISION";
  }

  const lastPickedBy: PickingAuditLog = {
    uid: auditUser.uid,
    userName: auditUser.userName,
    action: resolvedAction,
    timestamp: now,
  };

  const nextPickingStatus: ItemPickingStatus =
    updatedItemPatch.pickingStatus ??
    currentItem.pickingStatus ??
    "PENDIENTE_REVISION";

  const nextCantidadAlistada =
    updatedItemPatch.cantidadAlistada !== undefined
      ? Number(updatedItemPatch.cantidadAlistada)
      : currentItem.cantidadAlistada ?? currentItem.cantidad;

  const nextPickerNote =
    updatedItemPatch.pickerNote !== undefined
      ? updatedItemPatch.pickerNote.trim()
      : currentItem.pickerNote;

  const updatedItem: OrderItem = sanitizeOrderItem({
    ...currentItem,
    pickingStatus: nextPickingStatus,
    cantidadAlistada: nextCantidadAlistada,
    ...(nextPickerNote !== undefined ? { pickerNote: nextPickerNote } : {}),
    lastPickedBy,
  });

  const updatedItems = order.items.map((item, idx) =>
    idx === itemIndex ? updatedItem : sanitizeOrderItem(item)
  );

  const pickingProgress = computePickingProgress(updatedItems);
  const nextEstado = "EN_ALISTAMIENTO" as const;

  await updateDoc(orderRef, {
    items: updatedItems,
    pickingProgress,
    estado: nextEstado,
    updatedAt: now,
  });

  return {
    ...order,
    items: updatedItems,
    pickingProgress,
    estado: nextEstado,
    updatedAt: now,
  };
}

export async function toggleGeneralObservationCheck(
  orderId: string,
  checked: boolean,
  auditUser: PickingAuditUser
): Promise<PickingAuditLog> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();

  const generalObservationAudit: PickingAuditLog = {
    uid: auditUser.uid,
    userName: auditUser.userName,
    action: "OBS_GENERAL_CHECK",
    timestamp: now,
  };

  await updateDoc(orderRef, {
    generalObservationChecked: checked,
    generalObservationAudit,
    updatedAt: now,
  });

  return generalObservationAudit;
}

export async function completeOrderFulfillment(
  orderId: string,
  auditUser?: PickingAuditUser
): Promise<void> {
  void auditUser;
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();

  await updateDoc(orderRef, {
    estado: "ALISTADO",
    pickingProgress: 100,
    updatedAt: now,
  });
}
