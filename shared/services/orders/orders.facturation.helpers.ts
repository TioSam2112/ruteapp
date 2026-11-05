import type {
  ClientOrderData,
  Order,
  OrderItem,
  OrderSellerEditAudit,
  PickingAuditUser,
  UpdateOrderFacturationPayload,
} from "../../types/order";
import { computePickingProgress, sanitizeOrderItem } from "./orders.helpers";

export function normalizeClientOrderData(
  clientData: ClientOrderData
): ClientOrderData {
  return {
    nombre: clientData.nombre.trim(),
    ...(clientData.nit ? { nit: clientData.nit.trim() } : {}),
    ...(clientData.telefono ? { telefono: clientData.telefono.trim() } : {}),
    ...(clientData.direccion ? { direccion: clientData.direccion.trim() } : {}),
    ...(clientData.ciudad ? { ciudad: clientData.ciudad.trim() } : {}),
  };
}

export function mergeOrderItemsForFacturationEdit(
  currentItems: readonly OrderItem[],
  incomingItems: readonly OrderItem[],
  hadWarehouseProgress: boolean,
  now: string
): OrderItem[] {
  if (!hadWarehouseProgress) {
    return incomingItems.map((item) =>
      sanitizeOrderItem({
        id_producto: item.id_producto,
        sku: item.sku,
        nombre: item.nombre,
        precioVentaAtSale: Number(item.precioVentaAtSale),
        cantidad: Number(item.cantidad),
        unidadMedida: item.unidadMedida,
        ...(item.observationItem ? { observationItem: item.observationItem.trim() } : {}),
        subtotal: Number(item.subtotal),
      })
    );
  }

  const existingByProductId = new Map<string, OrderItem>(
    currentItems.map((item) => [item.id_producto, item])
  );

  return incomingItems.map((incoming) => {
    const existing = existingByProductId.get(incoming.id_producto);
    const incomingQty = Number(incoming.cantidad);
    const nextObs = incoming.observationItem?.trim();

    if (existing && Number(existing.cantidad) === incomingQty) {
      const preserved: OrderItem = {
        ...existing,
        sku: incoming.sku,
        nombre: incoming.nombre,
        precioVentaAtSale: Number(incoming.precioVentaAtSale),
        cantidad: incomingQty,
        unidadMedida: incoming.unidadMedida,
        subtotal: Number(incoming.subtotal),
      };
      if (nextObs) preserved.observationItem = nextObs;
      else delete preserved.observationItem;
      return sanitizeOrderItem(preserved);
    }

    return sanitizeOrderItem({
      id_producto: incoming.id_producto,
      sku: incoming.sku,
      nombre: incoming.nombre,
      precioVentaAtSale: Number(incoming.precioVentaAtSale),
      cantidad: incomingQty,
      unidadMedida: incoming.unidadMedida,
      ...(nextObs ? { observationItem: nextObs } : {}),
      subtotal: Number(incoming.subtotal),
      pickingStatus: "PENDIENTE_REVISION",
      cantidadAlistada: incomingQty,
      ...(existing?.pickerNote ? { pickerNote: existing.pickerNote } : {}),
      isAddedAfterCreation: true,
      ...(existing ? { previousQuantity: Number(existing.cantidad) } : {}),
      addedAt: now,
    });
  });
}

export function buildSellerEditAudit(
  currentOrder: Order,
  payload: UpdateOrderFacturationPayload,
  auditUser: PickingAuditUser,
  resolvedUid: string,
  now: string
): OrderSellerEditAudit {
  const existingMap = new Map(currentOrder.items.map((i) => [i.id_producto, i]));
  const incomingIds = new Set(payload.items.map((i) => i.id_producto));

  let addedCount = 0;
  let modifiedCount = 0;
  for (const incoming of payload.items) {
    const existing = existingMap.get(incoming.id_producto);
    if (!existing) addedCount += 1;
    else if (Number(existing.cantidad) !== Number(incoming.cantidad)) modifiedCount += 1;
  }

  const removedCount = currentOrder.items.filter(
    (existing) => !incomingIds.has(existing.id_producto)
  ).length;

  const parts: string[] = [];
  if (
    currentOrder.id_cliente !== payload.id_cliente ||
    currentOrder.clientData.nombre.trim() !== payload.clientData.nombre.trim()
  ) {
    parts.push("Cliente actualizado");
  }
  if (addedCount > 0) {
    parts.push(`+${addedCount} ${addedCount === 1 ? "producto añadido" : "productos añadidos"}`);
  }
  if (modifiedCount > 0) {
    parts.push(`${modifiedCount} ${modifiedCount === 1 ? "cantidad editada" : "cantidades editadas"}`);
  }
  if (removedCount > 0) {
    parts.push(`${removedCount} ${removedCount === 1 ? "producto eliminado" : "productos eliminados"}`);
  }
  if ((currentOrder.generalObservation?.trim() || "") !== (payload.generalObservation?.trim() || "")) {
    parts.push("Observación actualizada");
  }

  return {
    uid: resolvedUid,
    userName: auditUser.userName,
    timestamp: now,
    summary: parts.length > 0 ? parts.join(", ") : "Factura editada por facturación",
  };
}

export function buildFacturationEditPatch(
  currentOrder: Order,
  payload: UpdateOrderFacturationPayload,
  auditUser: PickingAuditUser,
  resolvedUid: string,
  now: string
): Partial<Order> {
  const hadWarehouseProgress =
    currentOrder.estado === "EN_ALISTAMIENTO" || currentOrder.estado === "ALISTADO";
  const mergedItems = mergeOrderItemsForFacturationEdit(
    currentOrder.items,
    payload.items,
    hadWarehouseProgress,
    now
  );
  const prevObs = currentOrder.generalObservation?.trim() || "";
  const nextObs = payload.generalObservation?.trim() || "";
  const normalizedTotal = Number(payload.total);

  const basePatch: Partial<Order> = {
    id_cliente: payload.id_cliente,
    clientData: normalizeClientOrderData(payload.clientData),
    items: mergedItems,
    generalObservation: nextObs,
    totalBase: Number(payload.totalBase),
    totalTax: Number(payload.totalTax),
    total: normalizedTotal,
    initialTotal: normalizedTotal,
    lastSellerEdit: buildSellerEditAudit(currentOrder, payload, auditUser, resolvedUid, now),
    updatedAt: now,
  };

  if (!hadWarehouseProgress) return basePatch;

  return {
    ...basePatch,
    generalObservationChecked:
      prevObs !== nextObs ? false : Boolean(currentOrder.generalObservationChecked),
    estado: "EN_ALISTAMIENTO",
    pickingProgress: computePickingProgress(mergedItems),
    hasPostPickingAdditions: true,
  };
}
