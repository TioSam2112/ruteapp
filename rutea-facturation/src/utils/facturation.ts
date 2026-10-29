import type { Product } from "@/types/product";

export function searchPosProducts(
  products: readonly Product[],
  query: string,
  limit: number = 8
): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return products
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.codigo && p.codigo.toLowerCase().includes(q)) ||
        p.categoria.toLowerCase().includes(q)
    )
    .slice(0, limit);
}
