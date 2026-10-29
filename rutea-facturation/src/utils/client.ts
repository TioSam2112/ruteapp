import type { Client } from "@/types/client";

export interface ClientMetrics {
  totalCount: number;
  citiesCount: number;
  businessesCount: number;
}

export function getClientInitials(
  client: Pick<Client, "nombre"> & { nombreComercio?: string | null }
): string {
  const target = client.nombreComercio || client.nombre;
  const parts = target.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return target.slice(0, 2).toUpperCase();
}

export function extractClientCities(clients: readonly Client[]): string[] {
  const uniqueCities = new Set<string>();
  clients.forEach((c) => {
    if (c.ciudad) {
      uniqueCities.add(c.ciudad);
    }
  });
  return Array.from(uniqueCities).sort();
}

export function filterClients(
  clients: readonly Client[],
  searchTerm: string,
  selectedCity: string
): Client[] {
  const query = searchTerm.toLowerCase().trim();

  return clients.filter((c) => {
    const matchesSearch =
      query === "" ||
      c.nombre.toLowerCase().includes(query) ||
      (c.nombreComercio && c.nombreComercio.toLowerCase().includes(query)) ||
      c.telefono.toLowerCase().includes(query) ||
      c.ciudad.toLowerCase().includes(query) ||
      c.direccion.toLowerCase().includes(query);

    const matchesCity = selectedCity === "ALL" || c.ciudad === selectedCity;

    return matchesSearch && matchesCity;
  });
}

export function searchClients(
  clients: readonly Client[],
  search: string
): Client[] {
  const q = search.toLowerCase().trim();
  if (!q) return [...clients];

  return clients.filter(
    (c) =>
      c.nombre.toLowerCase().includes(q) ||
      (c.nombreComercio && c.nombreComercio.toLowerCase().includes(q)) ||
      c.telefono.toLowerCase().includes(q) ||
      c.ciudad.toLowerCase().includes(q) ||
      c.direccion.toLowerCase().includes(q)
  );
}

export function calculateClientMetrics(clients: readonly Client[]): ClientMetrics {
  const totalCount = clients.length;
  const citiesCount = new Set(
    clients.map((c) => c.ciudad.trim().toLowerCase())
  ).size;
  const businessesCount = clients.filter((c) => Boolean(c.nombreComercio)).length;

  return { totalCount, citiesCount, businessesCount };
}
