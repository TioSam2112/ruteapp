import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
  CreateOrderData,
  Order,
  PickingAuditUser,
  UpdateOrderFacturationPayload,
} from "../../types/order";
import {
  ORDERS_COLLECTION,
  buildReliquidationSummary,
  mapOrderDoc,
  sanitizeOrderItem,
} from "./orders.helpers";
import {
  buildFacturationEditPatch,
  normalizeClientOrderData,
} from "./orders.facturation.helpers";
import { generateNextFacturaNumber, getOrderById } from "./orders.queries.service";

export { getOrderById };

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const newDocRef = doc(collection(db, ORDERS_COLLECTION));
  const now = new Date().toISOString();
  const facturaNumber = data.facturaNumber || (await generateNextFacturaNumber());
  const normalizedTotal = Number(data.total);
  const initialTotal =
    data.initialTotal !== undefined
      ? Number(data.initialTotal)
      : normalizedTotal;

  const order: Order = {
    id: newDocRef.id,
    facturaNumber,
    id_cliente: data.id_cliente,
    clientData: normalizeClientOrderData(data.clientData),
    id_vendedor: data.id_vendedor,
    ...(data.vendedorNombre ? { vendedorNombre: data.vendedorNombre.trim() } : {}),
    items: data.items.map((item) =>
      sanitizeOrderItem({
        id_producto: item.id_producto,
        sku: item.sku,
        nombre: item.nombre,
        precioVentaAtSale: Number(item.precioVentaAtSale),
        cantidad: Number(item.cantidad),
        unidadMedida: item.unidadMedida,
        ...(item.observationItem
          ? { observationItem: item.observationItem.trim() }
          : {}),
        subtotal: Number(item.subtotal),
      })
    ),
    ...(data.generalObservation
      ? { generalObservation: data.generalObservation.trim() }
      : {}),
    totalBase: Number(data.totalBase),
    totalTax: Number(data.totalTax),
    total: normalizedTotal,
    initialTotal,
    ...(data.reliquidation ? { reliquidation: data.reliquidation } : {}),
    estado: data.estado || "PENDIENTE_ALISTAMIENTO",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, order);
  return order;
}

export async function updateOrderFromFacturation(
  orderId: string,
  payload: UpdateOrderFacturationPayload,
  auditUser: PickingAuditUser
): Promise<Order> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`La orden con ID "${orderId}" no existe.`);
  }

  const currentOrder = mapOrderDoc(snapshot.id, snapshot.data());
  const now = new Date().toISOString();
  const resolvedUid = auth.currentUser?.uid || auditUser.uid;
  const patch = buildFacturationEditPatch(
    currentOrder,
    payload,
    auditUser,
    resolvedUid,
    now
  );

  await updateDoc(orderRef, patch);

  return {
    ...currentOrder,
    ...patch,
  };
}

export function subscribeToSellerOrders(
  sellerUid: string,
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("id_vendedor", "==", sellerUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs
        .map((d) => mapOrderDoc(d.id, d.data()))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      callback(orders);
    },
    (err) => onError?.(err)
  );
}

export async function approveOrderForDelivery(
  orderId: string,
  sellerAudit?: PickingAuditUser
): Promise<Order> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`La orden con ID "${orderId}" no existe.`);
  }

  const order = mapOrderDoc(snapshot.id, snapshot.data());
  const now = new Date().toISOString();
  const sanitizedItems = order.items.map((item) => sanitizeOrderItem(item));
  const reliquidation = buildReliquidationSummary(
    { ...order, items: sanitizedItems },
    sellerAudit,
    now
  );
  const nextEstado = "LISTO_PARA_REPARTO" as const;

  await updateDoc(orderRef, {
    items: sanitizedItems,
    initialTotal: reliquidation.totalOriginal,
    reliquidation,
    estado: nextEstado,
    updatedAt: now,
  });

  return {
    ...order,
    items: sanitizedItems,
    initialTotal: reliquidation.totalOriginal,
    reliquidation,
    estado: nextEstado,
    updatedAt: now,
  };
}
