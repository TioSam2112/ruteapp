import type { Metadata } from "next";
import { FacturationPosView } from "@/components/facturation/FacturationPosView";

export const metadata: Metadata = {
  title: "Terminal POS — Rutea Facturación",
  description: "Terminal punto de venta y preventa en tiempo real.",
};

export const instant = false;

export default function FacturationPage() {
  return <FacturationPosView />;
}
