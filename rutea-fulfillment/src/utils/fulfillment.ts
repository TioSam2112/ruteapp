import type {
  ItemPickingStatus,
  Order,
  OrderItem,
  PickingAuditLog,
  PickingAuditUser,
  UserProfile,
} from "@rutea/shared";
import { getUserFullName } from "@rutea/shared";
import type {
  FulfillmentFilterMode,
  QueueFilter,
} from "@/constants/picking";

export type { FulfillmentFilterMode, QueueFilter };

export interface OrderPickingStats {
  totalItems: number;
  resolvedItems: number;
  pendingItems: number;
  alistadosCount: number;
  agotadosCount: number;
  pendientesLlegadaCount: number;
  pendientesRevisionCount: number;
  progressPercentage: number;
  isReadyToComplete: boolean;
}

export interface CityOrdersGroup {
  ciudad: string;
  orders: Order[];
  totalOrders: number;
  pendingArrivalOrders: number;
}

const DEFAULT_FALLBACK_CITY = "Sin población especificada";

export function getItemPickingStatus(item: OrderItem): ItemPickingStatus {
  return item.pickingStatus ?? "PENDIENTE_REVISION";
}

export function isOrderItemResolved(item: OrderItem): boolean {
  const status = getItemPickingStatus(item);
  return status === "ALISTADO" || status === "AGOTADO";
}

export function calculateOrderPickingProgress(
  source:
    | Pick<Order, "items" | "generalObservation" | "generalObservationChecked">
    | readonly OrderItem[]
): OrderPickingStats {
  const items: readonly OrderItem[] = Array.isArray(source)
    ? source
    : (source as Pick<Order, "items">).items;

  const totalItems = items.length;
  let alistadosCount = 0;
  let agotadosCount = 0;
  let pendientesLlegadaCount = 0;
  let pendientesRevisionCount = 0;

  for (const item of items) {
    const status = getItemPickingStatus(item);
    if (status === "ALISTADO") {
      alistadosCount += 1;
    } else if (status === "AGOTADO") {
      agotadosCount += 1;
    } else if (status === "PENDIENTE_LLEGADA") {
      pendientesLlegadaCount += 1;
    } else {
      pendientesRevisionCount += 1;
    }
  }

  const resolvedItems = alistadosCount + agotadosCount;
  const pendingItems = totalItems - resolvedItems;
  const progressPercentage =
    totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

  const hasUncheckedGeneralObs =
    !Array.isArray(source) &&
    Boolean(
      (
        source as Pick<
          Order,
          "generalObservation" | "generalObservationChecked"
        >
      ).generalObservation?.trim()
    ) &&
    !(
      source as Pick<
        Order,
        "generalObservation" | "generalObservationChecked"
      >
    ).generalObservationChecked;

  const isReadyToComplete =
    totalItems > 0 && pendingItems === 0 && !hasUncheckedGeneralObs;

  return {
    totalItems,
    resolvedItems,
    pendingItems,
    alistadosCount,
    agotadosCount,
    pendientesLlegadaCount,
    pendientesRevisionCount,
    progressPercentage,
    isReadyToComplete,
  };
}

export function getOrderProgressPercentage(
  order: Pick<Order, "items" | "pickingProgress">
): number {
  return calculateOrderPickingProgress(order.items).progressPercentage;
}

export function getPendingItemsCount(
  source: Pick<Order, "items"> | readonly OrderItem[]
): number {
  return calculateOrderPickingProgress(source).pendingItems;
}

export function isOrderFromToday(
  order: Pick<Order, "createdAt">,
  referenceDate: Date = new Date()
): boolean {
  const orderDate = new Date(order.createdAt);
  if (Number.isNaN(orderDate.getTime())) {
    return false;
  }

  return (
    orderDate.getFullYear() === referenceDate.getFullYear() &&
    orderDate.getMonth() === referenceDate.getMonth() &&
    orderDate.getDate() === referenceDate.getDate()
  );
}

export function isOrderAvailableForFulfillment(
  order: Pick<Order, "estado">
): boolean {
  return (
    order.estado === "PENDIENTE_ALISTAMIENTO" ||
    order.estado === "EN_ALISTAMIENTO"
  );
}

export function isOrderCompletedByFulfillment(
  order: Pick<Order, "estado">
): boolean {
  return (
    order.estado === "ALISTADO" || order.estado === "LISTO_PARA_REPARTO"
  );
}

export function hasOrderPostPickingAdditions(
  order: Pick<Order, "hasPostPickingAdditions" | "items">
): boolean {
  if (order.hasPostPickingAdditions === true) {
    return true;
  }

  return order.items.some(
    (item) =>
      item.isAddedAfterCreation === true &&
      getItemPickingStatus(item) === "PENDIENTE_REVISION"
  );
}

export function hasOrderPendingArrivalItems(
  order: Pick<Order, "items">
): boolean {
  return order.items.some(
    (item) => getItemPickingStatus(item) === "PENDIENTE_LLEGADA"
  );
}

export function filterAvailableFulfillmentOrders(
  orders: readonly Order[]
): Order[] {
  return orders.filter(isOrderAvailableForFulfillment);
}

export function filterOrdersFromToday(
  orders: readonly Order[],
  referenceDate: Date = new Date()
): Order[] {
  return filterAvailableFulfillmentOrders(orders).filter((order) =>
    isOrderFromToday(order, referenceDate)
  );
}

export function filterModifiedFulfillmentOrders(
  orders: readonly Order[]
): Order[] {
  return filterAvailableFulfillmentOrders(orders).filter(
    hasOrderPostPickingAdditions
  );
}

export function filterOrdersWithPendingArrival(
  orders: readonly Order[]
): Order[] {
  return filterAvailableFulfillmentOrders(orders).filter(
    hasOrderPendingArrivalItems
  );
}

export function filterHistoryFulfillmentOrders(
  orders: readonly Order[]
): Order[] {
  return orders.filter(isOrderCompletedByFulfillment);
}

export function countModifiedOrders(orders: readonly Order[]): number {
  return filterModifiedFulfillmentOrders(orders).length;
}

export function filterFulfillmentOrders(
  orders: readonly Order[],
  filter: QueueFilter | FulfillmentFilterMode,
  referenceDate: Date = new Date()
): Order[] {
  switch (filter) {
    case "today":
    case "HOY":
      return filterOrdersFromToday(orders, referenceDate);
    case "modified":
      return filterModifiedFulfillmentOrders(orders);
    case "pending_items":
    case "PENDIENTE_LLEGADA":
      return filterOrdersWithPendingArrival(orders);
    case "history":
      return filterHistoryFulfillmentOrders(orders);
    case "available":
    case "TODAS":
    default:
      return filterAvailableFulfillmentOrders(orders);
  }
}

export function sortOrdersFIFO(orders: readonly Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    return timeA - timeB;
  });
}

export function groupOrdersByCityFIFO(
  orders: readonly Order[],
  fallbackCity: string = DEFAULT_FALLBACK_CITY
): CityOrdersGroup[] {
  const groupedMap = new Map<string, { label: string; orders: Order[] }>();

  for (const order of orders) {
    const rawCity = order.clientData.ciudad?.trim();
    const cityLabel = rawCity && rawCity.length > 0 ? rawCity : fallbackCity;
    const normalizedKey = cityLabel.toLocaleLowerCase("es-CO");

    const existing = groupedMap.get(normalizedKey);
    if (existing) {
      existing.orders.push(order);
    } else {
      groupedMap.set(normalizedKey, {
        label: cityLabel,
        orders: [order],
      });
    }
  }

  return Array.from(groupedMap.values())
    .map(({ label, orders: cityOrders }) => {
      const sortedOrders = sortOrdersFIFO(cityOrders);
      const pendingArrivalOrders = sortedOrders.filter(
        hasOrderPendingArrivalItems
      ).length;

      return {
        ciudad: label,
        orders: sortedOrders,
        totalOrders: sortedOrders.length,
        pendingArrivalOrders,
      };
    })
    .sort((a, b) => a.ciudad.localeCompare(b.ciudad, "es-CO"));
}

export interface FulfillmentFilterCounts {
  today: number;
  available: number;
  modified: number;
  pending_items: number;
  history: number;
  HOY: number;
  TODAS: number;
  PENDIENTE_LLEGADA: number;
}

export function getFulfillmentFilterCounts(
  orders: readonly Order[],
  referenceDate: Date = new Date()
): FulfillmentFilterCounts {
  const today = filterOrdersFromToday(orders, referenceDate).length;
  const available = filterAvailableFulfillmentOrders(orders).length;
  const modified = countModifiedOrders(orders);
  const pending_items = filterOrdersWithPendingArrival(orders).length;
  const history = filterHistoryFulfillmentOrders(orders).length;

  return {
    today,
    available,
    modified,
    pending_items,
    history,
    HOY: today,
    TODAS: available,
    PENDIENTE_LLEGADA: pending_items,
  };
}

export function formatOrderArrivalTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export interface OrderFulfillmentStatusMeta {
  label: string;
  tone: "pending" | "in_progress" | "completed" | "dispatched";
}

export function getOrderFulfillmentStatusMeta(
  estado: Order["estado"]
): OrderFulfillmentStatusMeta {
  switch (estado) {
    case "EN_ALISTAMIENTO":
      return { label: "En alistamiento", tone: "in_progress" };
    case "ALISTADO":
      return { label: "Alistada", tone: "completed" };
    case "LISTO_PARA_REPARTO":
      return { label: "En Despacho", tone: "dispatched" };
    case "PENDIENTE_ALISTAMIENTO":
    default:
      return { label: "Por alistar", tone: "pending" };
  }
}

export function formatPendingItemsCopy(stats: OrderPickingStats): string {
  if (stats.totalItems === 0) {
    return "Sin productos";
  }
  if (stats.pendingItems === 0) {
    return `${stats.totalItems} de ${stats.totalItems} productos listos`;
  }
  if (stats.pendingItems === 1) {
    return `Falta 1 de ${stats.totalItems} productos`;
  }
  return `Faltan ${stats.pendingItems} de ${stats.totalItems} productos`;
}

export interface OrderQueueCardSummary {
  stats: OrderPickingStats;
  progressCopy: string;
  percentageLabel: string;
  arrivalTimeLabel: string;
  statusMeta: OrderFulfillmentStatusMeta;
  vendedorLabel: string;
  hasGeneralObservation: boolean;
  isGeneralObservationChecked: boolean;
  hasPendingArrival: boolean;
  hasPostPickingAdditions: boolean;
}

export function getOrderQueueCardSummary(order: Order): OrderQueueCardSummary {
  const stats = calculateOrderPickingProgress(order);
  const hasGeneralObservation = Boolean(order.generalObservation?.trim());

  return {
    stats,
    progressCopy: formatPendingItemsCopy(stats),
    percentageLabel: `${stats.progressPercentage}%`,
    arrivalTimeLabel: formatOrderArrivalTime(order.createdAt),
    statusMeta: getOrderFulfillmentStatusMeta(order.estado),
    vendedorLabel: order.vendedorNombre?.trim() || "Preventa",
    hasGeneralObservation,
    isGeneralObservationChecked: Boolean(order.generalObservationChecked),
    hasPendingArrival: stats.pendientesLlegadaCount > 0,
    hasPostPickingAdditions: hasOrderPostPickingAdditions(order),
  };
}

export function isAuthorizedPickingRole(rol?: string | null): boolean {
  return rol === "picker" || rol === "alistador" || rol === "admin";
}

export function getEffectiveItemPickedQuantity(item: OrderItem): number {
  return item.cantidadAlistada !== undefined
    ? item.cantidadAlistada
    : item.cantidad;
}

export function formatPickingAuditTrail(
  audit?: PickingAuditLog,
  checkedState?: boolean
): string | null {
  if (!audit) return null;

  const time = formatOrderArrivalTime(audit.timestamp);
  const name = audit.userName.trim() || "Operador";

  switch (audit.action) {
    case "ALISTADO":
      return `Alistado por ${name} a las ${time}`;
    case "PENDIENTE_LLEGADA":
      return `Pendiente de llegada por ${name} a las ${time}`;
    case "AGOTADO":
      return `Agotado por ${name} a las ${time}`;
    case "CANTIDAD_AJUSTADA":
      return `Cantidad ajustada por ${name} a las ${time}`;
    case "NOTA_EDITADA":
      return `Nota editada por ${name} a las ${time}`;
    case "OBS_GENERAL_CHECK":
      return checkedState === false
        ? `Desmarcado por ${name} a las ${time}`
        : `Revisado por ${name} a las ${time}`;
    case "PENDIENTE_REVISION":
    default:
      return `En revisión por ${name} a las ${time}`;
  }
}

export function buildPickingAuditUser(
  profile: UserProfile | null
): PickingAuditUser {
  if (!profile) {
    return {
      uid: "operador-sesion",
      userName: "Alistador",
    };
  }

  const fullName =
    profile.nombre || profile.apellido
      ? getUserFullName(profile)
      : profile.email;

  return {
    uid: profile.uid,
    userName: fullName,
  };
}
