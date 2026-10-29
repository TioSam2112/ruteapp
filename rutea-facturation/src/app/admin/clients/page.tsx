import type { Metadata } from "next";
import { ClientsView } from "@/components/admin/clients/ClientsView";

export const metadata: Metadata = {
  title: "Directorio de Clientes — Rutea Admin",
  description: "Gestión de comercios, clientes y direcciones de entrega para preventa y facturación.",
};

export const instant = false;

export default function ClientsPage() {
  return <ClientsView />;
}
