import {
  roundCurrency,
  type DeliveryCrewMember,
  type DeliverySession,
  type Order,
} from "@rutea/shared";
import { DEFAULT_UNSPECIFIED_CITY } from "@/constants/dispatch";
import type {
  AssignedCityInvoiceGroup,
  DeliveryCrewDisplayMember,
  DeliveryRouteProgress,
} from "@/types/delivery";
import { resolveOrderExpectedAmount } from "@/utils/dispatch";

export function getCrewMemberInitials(nombre: string): string {
  const parts = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "RP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function buildCrewDisplayList(
  crew: readonly DeliveryCrewMember[],
  currentUid?: string
): DeliveryCrewDisplayMember[] {
  return crew.map((member) => ({
    uid: member.uid,
    nombre: member.nombre,
    initials: getCrewMemberInitials(member.nombre),
    isCurrentUser: Boolean(currentUid && member.uid === currentUid),
    ...(member.email ? { email: member.email } : {}),
  }));
}

export function formatCompanionsSummary(
  crew: readonly DeliveryCrewMember[]
): string {
  if (crew.length === 0) return "Sin cuadrilla registrada";
  return crew.map((member) => member.nombre).join(", ");
}

export function calculateDeliveryRouteProgress(
  orders: readonly Order[],
  session: DeliverySession | null
): DeliveryRouteProgress {
  if (!session) {
    return {
      totalFacturas: 0,
      entregadasCount: 0,
      pendientesCount: 0,
      progressPercent: 0,
      totalMontoEsperado: 0,
      montoRecaudado: 0,
      montoPendiente: 0,
    };
  }

  const totalFacturas =
    orders.length > 0 ? orders.length : session.totalFacturas;

  const entregadasCount = orders.filter(
    (order) => order.estado === "ENTREGADO"
  ).length;
  const pendientesCount = Math.max(0, totalFacturas - entregadasCount);

  const progressPercent =
    totalFacturas > 0
      ? Math.min(100, Math.round((entregadasCount / totalFacturas) * 100))
      : 0;

  const calculatedExpected = roundCurrency(
    orders.reduce((sum, order) => sum + resolveOrderExpectedAmount(order), 0)
  );

  const totalMontoEsperado =
    orders.length > 0 ? calculatedExpected : session.totalMontoEsperado;

  const montoRecaudado = roundCurrency(
    orders
      .filter((order) => order.estado === "ENTREGADO")
      .reduce((sum, order) => sum + resolveOrderExpectedAmount(order), 0)
  );

  const montoPendiente = roundCurrency(
    Math.max(0, totalMontoEsperado - montoRecaudado)
  );

  return {
    totalFacturas,
    entregadasCount,
    pendientesCount,
    progressPercent,
    totalMontoEsperado,
    montoRecaudado,
    montoPendiente,
  };
}

export function groupSessionOrdersByCity(
  orders: readonly Order[],
  sessionPoblaciones: readonly string[]
): AssignedCityInvoiceGroup[] {
  const grouped = new Map<string, { ciudad: string; orders: Order[] }>();

  for (const poblacion of sessionPoblaciones) {
    const cleanCity = poblacion.trim();
    if (!cleanCity) continue;
    const key = cleanCity.toLocaleLowerCase("es-CO");
    if (!grouped.has(key)) {
      grouped.set(key, { ciudad: cleanCity, orders: [] });
    }
  }

  for (const order of orders) {
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
    .filter((entry) => entry.orders.length > 0 || sessionPoblaciones.length > 0)
    .map(({ ciudad, orders: cityOrders }) => {
      const sortedOrders = [...cityOrders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const entregadasCount = sortedOrders.filter(
        (o) => o.estado === "ENTREGADO"
      ).length;
      const totalFacturas = sortedOrders.length;
      const pendientesCount = Math.max(0, totalFacturas - entregadasCount);
      const totalMontoEsperado = roundCurrency(
        sortedOrders.reduce(
          (sum, order) => sum + resolveOrderExpectedAmount(order),
          0
        )
      );

      return {
        ciudad,
        orders: sortedOrders,
        totalFacturas,
        entregadasCount,
        pendientesCount,
        totalMontoEsperado,
      };
    });
}

