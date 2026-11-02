import type { Metadata } from "next";
import { SellerInvoicesView } from "@/components/facturation/SellerInvoicesView";

export const metadata: Metadata = {
  title: "Mis Facturas / Cierre — Rutea Facturación",
  description:
    "Bandeja de facturas agrupadas por población, re-liquidación comparativa y despacho.",
};

export const instant = false;

export default function SellerInvoicesPage() {
  return <SellerInvoicesView />;
}
