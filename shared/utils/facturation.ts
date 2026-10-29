import type { OrderItem } from "../types/order";

export function calculateItemSubtotal(cantidad: number, precio: number): number {
  return Math.round(cantidad * precio * 100) / 100;
}

export function calculateQuantityAdjustment(
  currentQty: number,
  delta: number,
  allowsDecimals: boolean
): number {
  const step = allowsDecimals ? delta : Math.round(delta);
  return Math.max(
    allowsDecimals ? 0.1 : 1,
    parseFloat((currentQty + step).toFixed(3))
  );
}

export function calculateOrderTotals(
  items: readonly OrderItem[],
  taxRate: number = 0
): { totalBase: number; totalTax: number; total: number } {
  const totalBase = items.reduce((acc, it) => acc + it.subtotal, 0);
  const totalTax = Math.round(totalBase * taxRate * 100) / 100;
  return { totalBase, totalTax, total: totalBase + totalTax };
}

export function mergeOrAddOrderItem(
  currentItems: readonly OrderItem[],
  newItem: OrderItem,
  editingIndex: number | null = null
): OrderItem[] {
  if (editingIndex !== null) {
    const next = [...currentItems];
    next[editingIndex] = newItem;
    return next;
  }

  const existingIdx = currentItems.findIndex(
    (it) =>
      it.id_producto === newItem.id_producto &&
      it.precioVentaAtSale === newItem.precioVentaAtSale &&
      it.observationItem === newItem.observationItem
  );

  if (existingIdx >= 0) {
    const next = [...currentItems];
    const existing = next[existingIdx];
    const newQty = existing.cantidad + newItem.cantidad;
    next[existingIdx] = {
      ...existing,
      cantidad: newQty,
      subtotal: calculateItemSubtotal(newQty, existing.precioVentaAtSale),
    };
    return next;
  }

  return [newItem, ...currentItems];
}

export function formatPosCurrency(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
}
