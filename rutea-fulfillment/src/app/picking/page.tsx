import type { Metadata } from "next";
import { PickingWorkspace } from "@/components/picking/PickingWorkspace";

export const metadata: Metadata = {
  title: "Alistamiento — Rutea",
  description: "Terminal operativa de alistamiento de facturas en tiempo real.",
};

export const instant = false;

export default function PickingPage() {
  return <PickingWorkspace />;
}
