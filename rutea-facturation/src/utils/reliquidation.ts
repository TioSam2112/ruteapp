import {
  calculateItemSubtotal,
  type ItemPickingStatus,
  type Order,
  type OrderItem,
  type OrderReliquidationSummary,
  type OrderStatus,
  type PickingAuditLog,
  type PickingAuditUser,
} from "@rutea/shared";

export const DEFAULT_FALLBACK_CITY = "Sin poblaciÃ³n especificada";

export type ItemChangeType =
  | "SIN_CAMBIO"
  | "CANTIDAD_REDUCIDA"
  | "CANTIDAD_AUMENTADA"
  | "AGOTADO"
  | "PENDIENTE";

export interface OrderItemInitialVersion {
  cantidad: number;
  subtotal: number;
}

export interface OrderItemPickedVersion {
  cantidadAlistada: number;
  subtotalAlistado: number;
  status: ItemPickingStatus;
  pickerNote?: string;
  lastPickedBy?: PickingAuditLog;
  pickerName?: string;
  pickedAt?: string;
}

export interface OrderItemComparison {
  itemIndex: number;
  id_producto: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  precioUnitario: number;
  observationItem?: string;
  initial: OrderItemInitialVersion;
  picked: OrderItemPickedVersion;
  deltaCantidad: number;
  deltaSubtotal: number;
  changeType: ItemChangeType;
  hasDiscrepancy: boolean;
  hasPickerNote: boolean;
}

export interface OrderVersionTotals {
  prodCount: number;
  artCount: number;
  subtotalBase: number;
  totalTax: number;
  total: number;
}

export interface OrderReliquidationComparison {
  orderId: string;
  facturaNumber: string;
  estado: OrderStatus;
  initialVersion: OrderVersionTotals;
  pickedVersion: OrderVersionTotals;
  summary: OrderReliquidationSummary;
  items: OrderItemComparison[];
  agotadosItems: OrderItemComparison[];
  modifiedItems: OrderItemComparison[];
  unchangedItems: OrderItemComparison[];
  itemsWithNotes: OrderItemComparison[];
  hasChanges: boolean;
  generalObservation?: string;
  generalObservationChecked: boolean;
  generalObservationAudit?: PickingAuditLog;
}

export type SellerInvoiceFilterMode =
  | "TODAS"
  | "EN_BODEGA"
  | "LISTAS_PARA_VALIDAR"
  | "ENVIADAS_A_REPARTO";

export interface SellerInvoiceFilterCounts {
  TODAS: number;
  EN_BODEGA: number;
  LISTAS_PARA_VALIDAR: number;
  ENVIADAS_A_REPARTO: number;
}

export interface SellerOrderStatusMeta {
  label: string;
  tone: "warehouse" | "picking" | "ready" | "delivery" | "cancelled";
}

export interface SellerCityOrdersGroup {
  ciudad: string;
  orders: Order[];
  totalOrders: number;
  inProgressCount: number;
  readyToReliquidateCount: number;
  dispatchedCount: number;
}

export function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatQuantityValue(value: number): string {
  const rounded = roundQuantity(value);
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString("es-CO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 3,
      });
}

export function getEffectivePickedStatus(
  item: OrderItem,
  orderEstado?: OrderStatus
): ItemPickingStatus {
  if (item.pickingStatus) {
    return item.pickingStatus;
  }
  if (
    orderEstado === "ALISTADO" ||
    orderEstado === "LISTO_PARA_REPARTO" ||
    orderEstado === "EN_RUTA" ||
    orderEstado === "ENTREGADO"
  ) {
    return "ALISTADO";
  }
  return "PENDIENTE_REVISION";
}

export function getEffectivePickedQuantity(
  item: OrderItem,
  orderEstado?: OrderStatus
): number {
  const status = getEffectivePickedStatus(item, orderEstado);
  if (status === "AGOTADO") {
    return 0;
  }
  if (item.cantidadAlistada !== undefined) {
    return roundQuantity(Number(item.cantidadAlistada));
  }
  return roundQuantity(Number(item.cantidad));
}

export function sortSellerOrdersByDate(
  orders: readonly Order[],
  direction: "asc" | "desc" = "desc"
): Order[] {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    return direction === "asc" ? timeA - timeB : timeB - timeA;
  });
}

export function filterSellerOrders(
  orders: readonly Order[],
  mode: SellerInvoiceFilterMode
): Order[] {
  switch (mode) {
    case "EN_BODEGA":
      return orders.filter(
        (o) =>
          o.estado === "PENDIENTE_ALISTAMIENTO" ||
          o.estado === "EN_ALISTAMIENTO"
      );
    case "LISTAS_PARA_VALIDAR":
      return orders.filter((o) => o.estado === "ALISTADO");
    case "ENVIADAS_A_REPARTO":
      return orders.filter(
        (o) =>
          o.estado === "LISTO_PARA_REPARTO" ||
          o.estado === "EN_RUTA" ||
          o.estado === "ENTREGADO"
      );
    case "TODAS":
    default:
      return [...orders];
  }
}

export function getSellerInvoiceFilterCounts(
  orders: readonly Order[]
): SellerInvoiceFilterCounts {
  return {
    TODAS: orders.length,
    EN_BODEGA: filterSellerOrders(orders, "EN_BODEGA").length,
    LISTAS_PARA_VALIDAR: filterSellerOrders(orders, "LISTAS_PARA_VALIDAR").length,
    ENVIADAS_A_REPARTO: filterSellerOrders(orders, "ENVIADAS_A_REPARTO").length,
  };
}

export function getSellerOrderStatusMeta(
  estado: OrderStatus
): SellerOrderStatusMeta {
  switch (estado) {
    case "PENDIENTE_ALISTAMIENTO":
      return { label: "En Bodega (Por alistar)", tone: "warehouse" };
    case "EN_ALISTAMIENTO":
      return { label: "En Bodega (Alistando)", tone: "picking" };
    case "ALISTADO":
      return { label: "Lista para Validar", tone: "ready" };
    case "LISTO_PARA_REPARTO":
      return { label: "Lista para Reparto", tone: "delivery" };
    case "EN_RUTA":
      return { label: "En Ruta", tone: "delivery" };
    case "ENTREGADO":
      return { label: "Entregada", tone: "delivery" };
    case "CANCELADO":
    default:
      return { label: "Cancelada", tone: "cancelled" };
  }
}

export function formatSellerOrderTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function groupSellerOrdersByCity(
  orders: readonly Order[],
  options?: {
    fallbackCity?: string;
    sortDirection?: "asc" | "desc";
  }
): SellerCityOrdersGroup[] {
  const fallbackCity = options?.fallbackCity ?? DEFAULT_FALLBACK_CITY;
  const sortDirection = options?.sortDirection ?? "desc";
  const grouped = new Map<string, { label: string; orders: Order[] }>();

  for (const order of orders) {
    const rawCity = order.clientData.ciudad?.trim();
    const cityLabel = rawCity && rawCity.length > 0 ? rawCity : fallbackCity;
    const key = cityLabel.toLocaleLowerCase("es-CO");

    const existing = grouped.get(key);
    if (existing) {
      existing.orders.push(order);
    } else {
      grouped.set(key, { label: cityLabel, orders: [order] });
    }
  }

  return Array.from(grouped.values())
    .map(({ label, orders: cityOrders }) => {
      const sortedOrders = sortSellerOrdersByDate(cityOrders, sortDirection);
      const inProgressCount = sortedOrders.filter(
        (o) =>
          o.estado === "PENDIENTE_ALISTAMIENTO" ||
          o.estado === "EN_ALISTAMIENTO"
      ).length;
      const readyToReliquidateCount = sortedOrders.filter(
        (o) => o.estado === "ALISTADO"
      ).length;
      const dispatchedCount = sortedOrders.filter(
        (o) =>
          o.estado === "LISTO_PARA_REPARTO" ||
          o.estado === "EN_RUTA" ||
          o.estado === "ENTREGADO"
      ).length;

      return {
        ciudad: label,
        orders: sortedOrders,
        totalOrders: sortedOrders.length,
        inProgressCount,
        readyToReliquidateCount,
        dispatchedCount,
      };
    })
    .sort((a, b) => a.ciudad.localeCompare(b.ciudad, "es-CO"));
}

export function calculateOrderReliquidationSummary(
  order: Pick<
    Order,
    "items" | "total" | "initialTotal" | "reliquidation" | "estado"
  >,
  auditUser?: PickingAuditUser
): OrderReliquidationSummary {
  const computedInitialTotal = roundCurrency(
    order.items.reduce(
      (sum, item) =>
        sum +
        calculateItemSubtotal(
          Number(item.cantidad),
          Number(item.precioVentaAtSale)
        ),
      0
    )
  );

  const totalOriginal =
    order.initialTotal !== undefined
      ? roundCurrency(Number(order.initialTotal))
      : order.reliquidation?.totalOriginal !== undefined
        ? roundCurrency(Number(order.reliquidation.totalOriginal))
        : computedInitialTotal > 0
          ? computedInitialTotal
          : roundCurrency(Number(order.total));

  const totalAlistado = roundCurrency(
    order.items.reduce((sum, item) => {
      const pickedQty = getEffectivePickedQuantity(item, order.estado);
      return (
        sum + calculateItemSubtotal(pickedQty, Number(item.precioVentaAtSale))
      );
    }, 0)
  );

  const diferencia = roundCurrency(totalAlistado - totalOriginal);
  const closedByUid = auditUser?.uid ?? order.reliquidation?.closedByUid;
  const closedByName =
    auditUser?.userName ?? order.reliquidation?.closedByName;
  const closedAt = order.reliquidation?.closedAt;

  return {
    totalOriginal,
    totalAlistado,
    diferencia,
    ...(closedByUid ? { closedByUid } : {}),
    ...(closedByName ? { closedByName } : {}),
    ...(closedAt ? { closedAt } : {}),
  };
}

export function buildOrderReliquidationComparison(
  order: Order
): OrderReliquidationComparison {
  const itemsComparison: OrderItemComparison[] = order.items.map(
    (item, itemIndex) => {
      const initialQty = roundQuantity(Number(item.cantidad));
      const precioUnitario = Number(item.precioVentaAtSale);
      const initialSubtotal = calculateItemSubtotal(initialQty, precioUnitario);

      const status = getEffectivePickedStatus(item, order.estado);
      const pickedQty = getEffectivePickedQuantity(item, order.estado);
      const pickedSubtotal = calculateItemSubtotal(pickedQty, precioUnitario);

      const deltaCantidad = roundQuantity(pickedQty - initialQty);
      const deltaSubtotal = roundCurrency(pickedSubtotal - initialSubtotal);
      const pickerNote = item.pickerNote?.trim() || undefined;

      let changeType: ItemChangeType = "SIN_CAMBIO";
      if (status === "AGOTADO" || pickedQty === 0) {
        changeType = "AGOTADO";
      } else if (
        status === "PENDIENTE_REVISION" ||
        status === "PENDIENTE_LLEGADA"
      ) {
        changeType =
          deltaCantidad < 0
            ? "CANTIDAD_REDUCIDA"
            : deltaCantidad > 0
              ? "CANTIDAD_AUMENTADA"
              : "PENDIENTE";
      } else if (deltaCantidad < 0) {
        changeType = "CANTIDAD_REDUCIDA";
      } else if (deltaCantidad > 0) {
        changeType = "CANTIDAD_AUMENTADA";
      }

      const hasDiscrepancy =
        status === "AGOTADO" || Math.abs(deltaCantidad) > 0.0001;

      return {
        itemIndex,
        id_producto: item.id_producto,
        sku: item.sku,
        nombre: item.nombre,
        unidadMedida: item.unidadMedida,
        precioUnitario,
        ...(item.observationItem
          ? { observationItem: item.observationItem }
          : {}),
        initial: {
          cantidad: initialQty,
          subtotal: initialSubtotal,
        },
        picked: {
          cantidadAlistada: pickedQty,
          subtotalAlistado: pickedSubtotal,
          status,
          ...(pickerNote ? { pickerNote } : {}),
          ...(item.lastPickedBy ? { lastPickedBy: item.lastPickedBy } : {}),
          ...(item.lastPickedBy?.userName
            ? { pickerName: item.lastPickedBy.userName }
            : {}),
          ...(item.lastPickedBy?.timestamp
            ? { pickedAt: item.lastPickedBy.timestamp }
            : {}),
        },
        deltaCantidad,
        deltaSubtotal,
        changeType,
        hasDiscrepancy,
        hasPickerNote: Boolean(pickerNote),
      };
    }
  );

  const summary = calculateOrderReliquidationSummary(order);
  const totalTax = roundCurrency(Number(order.totalTax ?? 0));

  const initialArtCount = roundQuantity(
    itemsComparison.reduce((sum, it) => sum + it.initial.cantidad, 0)
  );
  const initialSubtotalBase = roundCurrency(
    itemsComparison.reduce((sum, it) => sum + it.initial.subtotal, 0)
  );

  const activePickedItems = itemsComparison.filter(
    (it) => it.picked.status !== "AGOTADO" && it.picked.cantidadAlistada > 0
  );
  const pickedArtCount = roundQuantity(
    activePickedItems.reduce((sum, it) => sum + it.picked.cantidadAlistada, 0)
  );

  const agotadosItems = itemsComparison.filter(
    (it) => it.changeType === "AGOTADO"
  );
  const modifiedItems = itemsComparison.filter(
    (it) =>
      it.changeType === "CANTIDAD_REDUCIDA" ||
      it.changeType === "CANTIDAD_AUMENTADA"
  );
  const unchangedItems = itemsComparison.filter(
    (it) => it.changeType === "SIN_CAMBIO"
  );
  const itemsWithNotes = itemsComparison.filter((it) => it.hasPickerNote);

  const hasChanges =
    agotadosItems.length > 0 ||
    modifiedItems.length > 0 ||
    Math.abs(summary.diferencia) > 0.009;

  return {
    orderId: order.id,
    facturaNumber: order.facturaNumber,
    estado: order.estado,
    initialVersion: {
      prodCount: itemsComparison.length,
      artCount: initialArtCount,
      subtotalBase: initialSubtotalBase,
      totalTax,
      total: summary.totalOriginal,
    },
    pickedVersion: {
      prodCount: activePickedItems.length,
      artCount: pickedArtCount,
      subtotalBase: summary.totalAlistado,
      totalTax,
      total: roundCurrency(summary.totalAlistado + totalTax),
    },
    summary,
    items: itemsComparison,
    agotadosItems,
    modifiedItems,
    unchangedItems,
    itemsWithNotes,
    hasChanges,
    ...(order.generalObservation
      ? { generalObservation: order.generalObservation }
      : {}),
    generalObservationChecked: Boolean(order.generalObservationChecked),
    ...(order.generalObservationAudit
      ? { generalObservationAudit: order.generalObservationAudit }
      : {}),
  };
}

