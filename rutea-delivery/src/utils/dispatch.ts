import {
  buildReliquidationSummary,
  calculateItemSubtotal,
  roundCurrency,
  type ItemPickingStatus,
  type Order,
  type OrderItem,
} from "@rutea/shared";
import { DEFAULT_UNSPECIFIED_CITY } from "@/constants/dispatch";
import type {
  CityDispatchGroup,
  DispatchSelectionSummary,
  ReadOnlyItemComparisonRow,
  ReadOnlyOrderAuditView,
} from "@/types/dispatch";

function roundQuantity(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function formatDispatchQuantity(value: number): string {
  const rounded = roundQuantity(value);
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString("es-CO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 3,
      });
}

export function formatDispatchTimestamp(isoString?: string): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function resolveItemPickedStatus(item: OrderItem): ItemPickingStatus {
  return item.pickingStatus ?? "ALISTADO";
}

function resolveItemPickedQuantity(item: OrderItem): number {
  const status = resolveItemPickedStatus(item);
  if (status === "AGOTADO") return 0;
  if (item.cantidadAlistada !== undefined) {
    return roundQuantity(Number(item.cantidadAlistada));
  }
  return roundQuantity(Number(item.cantidad));
}

export function resolveOrderExpectedAmount(order: Order): number {
  if (order.reliquidation?.totalAlistado !== undefined) {
    return roundCurrency(Number(order.reliquidation.totalAlistado));
  }
  return buildReliquidationSummary(order).totalAlistado;
}

export function groupReadyOrdersByCity(
  orders: readonly Order[]
): CityDispatchGroup[] {
  const unassignedOrders = orders.filter((order) => !order.deliverySessionId);
  const grouped = new Map<string, { ciudad: string; orders: Order[] }>();

  for (const order of unassignedOrders) {
    const rawCity = order.clientData.ciudad?.trim();
    const ciudad =
      rawCity && rawCity.length > 0 ? rawCity : DEFAULT_UNSPECIFIED_CITY;
    const key = ciudad.toLocaleLowerCase("es-CO");

    const existing = grouped.get(key);
    if (existing) {
      existing.orders.push(order);
    } else {
      grouped.set(key, { ciudad, orders: [order] });
    }
  }

  return Array.from(grouped.values())
    .map(({ ciudad, orders: cityOrders }) => {
      const sortedOrders = [...cityOrders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const totalMontoEsperado = roundCurrency(
        sortedOrders.reduce(
          (sum, order) => sum + resolveOrderExpectedAmount(order),
          0
        )
      );

      return {
        ciudad,
        orders: sortedOrders,
        totalFacturas: sortedOrders.length,
        totalMontoEsperado,
      };
    })
    .sort((a, b) => a.ciudad.localeCompare(b.ciudad, "es-CO"));
}

export function buildSuggestedRouteName(cities: readonly string[]): string {
  if (cities.length === 0) return "";
  return `Ruta: ${cities.join(" - ")}`;
}

export function calculateDispatchSelectionSummary(
  groups: readonly CityDispatchGroup[],
  selectedCities: ReadonlySet<string>
): DispatchSelectionSummary {
  const selectedGroups = groups.filter((group) =>
    selectedCities.has(group.ciudad)
  );
  const selectedCityNames = selectedGroups.map((group) => group.ciudad);
  const selectedOrders = selectedGroups.flatMap((group) =>
    group.orders.map((order) => ({
      id: order.id,
      totalAlistado: resolveOrderExpectedAmount(order),
    }))
  );
  const totalMontoEsperado = roundCurrency(
    selectedOrders.reduce((sum, item) => sum + item.totalAlistado, 0)
  );

  return {
    selectedCities: selectedCityNames,
    selectedGroups,
    selectedOrders,
    totalPoblaciones: selectedGroups.length,
    totalFacturas: selectedOrders.length,
    totalMontoEsperado,
    suggestedRouteName: buildSuggestedRouteName(selectedCityNames),
  };
}

export function buildReadOnlyOrderAuditView(
  order: Order
): ReadOnlyOrderAuditView {
  const summary = order.reliquidation ?? buildReliquidationSummary(order);

  const rows: ReadOnlyItemComparisonRow[] = order.items.map((item) => {
    const cantidadOriginal = roundQuantity(Number(item.cantidad));
    const precioUnitario = Number(item.precioVentaAtSale);
    const status = resolveItemPickedStatus(item);
    const cantidadAlistada = resolveItemPickedQuantity(item);
    const subtotalOriginal = calculateItemSubtotal(
      cantidadOriginal,
      precioUnitario
    );
    const subtotalAlistado = calculateItemSubtotal(
      cantidadAlistada,
      precioUnitario
    );
    const deltaCantidad = roundQuantity(cantidadAlistada - cantidadOriginal);
    const pickerNote = item.pickerNote?.trim() || undefined;
    const observationItem = item.observationItem?.trim() || undefined;

    return {
      id_producto: item.id_producto,
      sku: item.sku,
      nombre: item.nombre,
      unidadMedida: item.unidadMedida,
      precioUnitario,
      cantidadOriginal,
      cantidadAlistada,
      subtotalOriginal,
      subtotalAlistado,
      deltaCantidad,
      status,
      ...(pickerNote ? { pickerNote } : {}),
      ...(observationItem ? { observationItem } : {}),
      ...(item.lastPickedBy?.userName
        ? { pickerName: item.lastPickedBy.userName }
        : {}),
      ...(item.lastPickedBy?.timestamp
        ? { pickedAt: item.lastPickedBy.timestamp }
        : {}),
      hasDiscrepancy:
        status === "AGOTADO" || Math.abs(deltaCantidad) > 0.0001,
    };
  });

  return {
    totalOriginal: summary.totalOriginal,
    totalAlistado: summary.totalAlistado,
    diferencia: summary.diferencia,
    ...(summary.closedByName ? { closedByName: summary.closedByName } : {}),
    ...(summary.closedAt ? { closedAt: summary.closedAt } : {}),
    rows,
  };
}

