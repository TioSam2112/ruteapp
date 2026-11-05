import type {
  ItemPickingStatus,
  Order,
  OrderItem,
  OrderReliquidationSummary,
  PickingAuditLog,
  PickingAuditUser,
} from "../../types/order";

export const ORDERS_COLLECTION = "orders";

export function mapOrderDoc(id: string, data: unknown): Order {
  return { id, ...(data as Omit<Order, "id">) };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function isItemResolved(status?: ItemPickingStatus): boolean {
  return status === "ALISTADO" || status === "AGOTADO";
}

export function computePickingProgress(items: readonly OrderItem[]): number {
  if (items.length === 0) return 0;
  const resolvedCount = items.filter((item) =>
    isItemResolved(item.pickingStatus)
  ).length;
  return Math.round((resolvedCount / items.length) * 100);
}

function resolvePickedQuantity(item: OrderItem): number {
  if (item.pickingStatus === "AGOTADO") {
    return 0;
  }
  if (item.cantidadAlistada !== undefined) {
    return Number(item.cantidadAlistada);
  }
  return Number(item.cantidad);
}

export function buildReliquidationSummary(
  order: Pick<Order, "items" | "total" | "initialTotal" | "reliquidation">,
  auditUser?: PickingAuditUser,
  timestamp?: string
): OrderReliquidationSummary {
  const computedInitial = roundCurrency(
    order.items.reduce(
      (acc, item) =>
        acc +
        roundCurrency(Number(item.cantidad) * Number(item.precioVentaAtSale)),
      0
    )
  );

  const totalOriginal =
    order.initialTotal !== undefined
      ? Number(order.initialTotal)
      : order.reliquidation?.totalOriginal !== undefined
        ? Number(order.reliquidation.totalOriginal)
        : computedInitial > 0
          ? computedInitial
          : Number(order.total);

  const totalAlistado = roundCurrency(
    order.items.reduce((acc, item) => {
      const pickedQty = resolvePickedQuantity(item);
      return acc + roundCurrency(pickedQty * Number(item.precioVentaAtSale));
    }, 0)
  );

  const diferencia = roundCurrency(totalAlistado - totalOriginal);
  const closedByUid = auditUser?.uid ?? order.reliquidation?.closedByUid;
  const closedByName =
    auditUser?.userName ?? order.reliquidation?.closedByName;
  const closedAt = timestamp ?? order.reliquidation?.closedAt;

  return {
    totalOriginal,
    totalAlistado,
    diferencia,
    ...(closedByUid ? { closedByUid } : {}),
    ...(closedByName ? { closedByName } : {}),
    ...(closedAt ? { closedAt } : {}),
  };
}

export function sanitizeOrderItem(item: OrderItem): OrderItem {
  const sanitized: OrderItem = {
    id_producto: item.id_producto,
    sku: item.sku,
    nombre: item.nombre,
    precioVentaAtSale: Number(item.precioVentaAtSale),
    cantidad: Number(item.cantidad),
    unidadMedida: item.unidadMedida,
    subtotal: Number(item.subtotal),
  };

  if (item.observationItem !== undefined && item.observationItem.trim() !== "") {
    sanitized.observationItem = item.observationItem.trim();
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
  if (item.isAddedAfterCreation !== undefined) {
    sanitized.isAddedAfterCreation = Boolean(item.isAddedAfterCreation);
  }
  if (item.previousQuantity !== undefined) {
    sanitized.previousQuantity = Number(item.previousQuantity);
  }
  if (item.addedAt !== undefined) {
    sanitized.addedAt = item.addedAt;
  }

  return sanitized;
}

export function buildSyncedObsAudit(
  order: Order,
  currentAuthUid: string | undefined,
  userName: string | undefined,
  now: string
): PickingAuditLog | undefined {
  const audit = order.generalObservationAudit;
  if (!audit || !currentAuthUid || audit.uid === currentAuthUid) {
    return undefined;
  }
  return {
    uid: currentAuthUid,
    userName: userName || audit.userName,
    action: "OBS_GENERAL_CHECK",
    timestamp: audit.timestamp || now,
  };
}
