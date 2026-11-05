import type { Metadata } from "next";
import { DeliveryWorkspace } from "@/components/delivery/DeliveryWorkspace";

export const metadata: Metadata = {
  title: "Workspace de Rutas y Entregas — Rutea",
  description: "Gestión operativa de rutas, entregas y recaudo por cuadrilla.",
};

export const instant = false;

export default function DeliveryWorkspacePage() {
  return <DeliveryWorkspace />;
}
