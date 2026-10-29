import type { Metadata } from "next";
import { ProductsView } from "@/components/admin/products/ProductsView";

export const metadata: Metadata = {
  title: "Catálogo de Productos — Rutea Admin",
  description: "Gestión de catálogo, unidades de medida, costos y stock para preventa.",
};

export const instant = false;

export default function ProductsPage() {
  return <ProductsView />;
}
