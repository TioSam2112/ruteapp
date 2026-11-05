import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
  ItemPickingStatus,
  Order,
  OrderItem,
  OrderItemPickingPatch,
  PickingAuditLog,
  PickingAuditUser,
} from "../../types/order";
import {
  ORDERS_COLLECTION,
  buildSyncedObsAudit,
  computePickingProgress,
  mapOrderDoc,
  sanitizeOrderItem,
} from "./orders.helpers";
import { resolvePickingAction } from "./orders.picking.helpers";
import { subscribeToFulfillmentOrders } from "./orders.queries.service";

export { subscribeToFulfillmentOrders };

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

  const lastPickedBy: PickingAuditLog = {
    uid: auth.currentUser?.uid || auditUser.uid,
    userName: auditUser.userName,
    action: resolvePickingAction(updatedItemPatch, currentItem),
    timestamp: now,
  };

  const nextPickingStatus: ItemPickingStatus =
    updatedItemPatch.pickingStatus ??
    currentItem.pickingStatus ??
    "PENDIENTE_REVISION";

  const nextCantidadAlistada =
    updatedItemPatch.cantidadAlistada !== undefined
      ? Number(updatedItemPatch.cantidadAlistada)
      : nextPickingStatus === "AGOTADO"
        ? 0
        : currentItem.cantidadAlistada ?? currentItem.cantidad;

  const nextPickerNote =
    updatedItemPatch.pickerNote !== undefined
      ? updatedItemPatch.pickerNote.trim()
      : currentItem.pickerNote;

  const updatedItem: OrderItem = sanitizeOrderItem({
    ...currentItem,
    cantidad: Number(currentItem.cantidad),
    subtotal: Number(currentItem.subtotal),
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
  const syncedObsAudit = buildSyncedObsAudit(
    order,
    auth.currentUser?.uid,
    auditUser.userName,
    now
  );

  await updateDoc(orderRef, {
    items: updatedItems,
    pickingProgress,
    estado: nextEstado,
    ...(syncedObsAudit ? { generalObservationAudit: syncedObsAudit } : {}),
    updatedAt: now,
  });

  return {
    ...order,
    items: updatedItems,
    pickingProgress,
    estado: nextEstado,
    ...(syncedObsAudit ? { generalObservationAudit: syncedObsAudit } : {}),
    updatedAt: now,
  };
}
