import type { Product } from "@/types/product";

export interface StockStatus {
  label: string;
  className: string;
}

export interface ProductMetrics {
  totalCount: number;
  lowStockCount: number;
  inventoryValuation: number;
}

export function getStockStatus(actual: number, minimo?: number): StockStatus {
  if (actual <= 0) {
    return {
      label: "Agotado",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }
  if (minimo !== undefined && actual <= minimo) {
    return {
      label: "Stock bajo",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  return {
    label: "En stock",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };
}

export function formatProductPrice(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatQuantity(val: number, allowsDecimals: boolean): string {
  if (!allowsDecimals || Number.isInteger(val)) {
    return val.toLocaleString("es-CO", { maximumFractionDigits: 0 });
  }
  return val.toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  });
}

export function extractProductCategories(products: readonly Product[]): string[] {
  const uniqueCategories = new Set<string>();
  products.forEach((p) => {
    if (p.categoria) {
      uniqueCategories.add(p.categoria);
    }
  });
  return Array.from(uniqueCategories).sort();
}

export function filterProducts(
  products: readonly Product[],
  searchTerm: string,
  selectedCategory: string,
  onlyLowStock: boolean
): Product[] {
  const query = searchTerm.toLowerCase().trim();

  return products.filter((p) => {
    const matchesSearch =
      query === "" ||
      p.nombre.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "ALL" || p.categoria === selectedCategory;

    const matchesLowStock =
      !onlyLowStock ||
      (p.stockMinimo !== undefined && p.stockActual <= p.stockMinimo) ||
      p.stockActual <= 0;

    return matchesSearch && matchesCategory && matchesLowStock;
  });
}

export function calculateProductMetrics(
  products: readonly Product[]
): ProductMetrics {
  const totalCount = products.length;
  const lowStockCount = products.filter(
    (p) =>
      (p.stockMinimo !== undefined && p.stockActual <= p.stockMinimo) ||
      p.stockActual <= 0
  ).length;
  const inventoryValuation = products.reduce(
    (acc, p) => acc + p.costoUnitario * p.stockActual,
    0
  );

  return { totalCount, lowStockCount, inventoryValuation };
}

export function formatValuationCurrency(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}
