import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
  ItemPickingStatus,
  OrderReliquidationSummary,
  PickingAuditLog,
  PickingAuditUser,
} from "../../types/order";
import {
  ORDERS_COLLECTION,
  buildReliquidationSummary,
  buildSyncedObsAudit,
  mapOrderDoc,
  sanitizeOrderItem,
} from "./orders.helpers";

export async function completeOrderFulfillment(
  orderId: string,
  auditUser?: PickingAuditUser
): Promise<OrderReliquidationSummary> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`La orden con ID "${orderId}" no existe.`);
  }

  const order = mapOrderDoc(snapshot.id, snapshot.data());
  const now = new Date().toISOString();
  const currentAuthUid = auth.currentUser?.uid;
  const resolvedAuditUser: PickingAuditUser | undefined =
    auditUser || currentAuthUid
      ? {
          uid: currentAuthUid || auditUser?.uid || "operador-sesion",
          userName: auditUser?.userName || "Alistador",
        }
      : undefined;

  const finalizedItems = order.items.map((item) => {
    const status: ItemPickingStatus =
      item.pickingStatus === "AGOTADO" ? "AGOTADO" : "ALISTADO";
    const cantidadAlistada =
      status === "AGOTADO"
        ? 0
        : item.cantidadAlistada !== undefined
          ? Number(item.cantidadAlistada)
          : Number(item.cantidad);
    const lastPickedBy: PickingAuditLog | undefined =
      item.lastPickedBy ??
      (resolvedAuditUser
        ? {
            uid: resolvedAuditUser.uid,
            userName: resolvedAuditUser.userName,
            action: status,
            timestamp: now,
          }
        : undefined);

    return sanitizeOrderItem({
      ...item,
      cantidad: Number(item.cantidad),
      subtotal: Number(item.subtotal),
      pickingStatus: status,
      cantidadAlistada,
      ...(lastPickedBy ? { lastPickedBy } : {}),
    });
  });

  const reliquidation = buildReliquidationSummary(
    { ...order, items: finalizedItems },
    resolvedAuditUser,
    now
  );

  const syncedObsAudit = buildSyncedObsAudit(
    order,
    currentAuthUid,
    resolvedAuditUser?.userName,
    now
  );

  await updateDoc(orderRef, {
    items: finalizedItems,
    estado: "ALISTADO",
    pickingProgress: 100,
    hasPostPickingAdditions: false,
    reliquidation,
    ...(syncedObsAudit ? { generalObservationAudit: syncedObsAudit } : {}),
    updatedAt: now,
  });

  return reliquidation;
}

export async function reopenOrderFulfillment(
  orderId: string,
  auditUser: PickingAuditUser
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    throw new Error(`La orden con ID "${orderId}" no existe.`);
  }

  const order = mapOrderDoc(snapshot.id, snapshot.data());

  if (order.estado === "LISTO_PARA_REPARTO") {
    throw new Error(
      "La factura ya fue autorizada para reparto y no puede reabrirse en bodega."
    );
  }

  if (order.estado !== "ALISTADO") {
    throw new Error("Solo se pueden reabrir facturas en estado ALISTADO.");
  }

  const now = new Date().toISOString();
  const syncedObsAudit = buildSyncedObsAudit(
    order,
    auth.currentUser?.uid,
    auditUser.userName,
    now
  );

  await updateDoc(orderRef, {
    estado: "EN_ALISTAMIENTO",
    ...(syncedObsAudit ? { generalObservationAudit: syncedObsAudit } : {}),
    updatedAt: now,
  });
}

export async function toggleGeneralObservationCheck(
  orderId: string,
  checked: boolean,
  auditUser: PickingAuditUser
): Promise<PickingAuditLog> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();

  const generalObservationAudit: PickingAuditLog = {
    uid: auth.currentUser?.uid || auditUser.uid,
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
