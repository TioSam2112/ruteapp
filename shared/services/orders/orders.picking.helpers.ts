import type { OrderItem, OrderItemPickingPatch, PickingAuditLog } from "../../types/order";

export function resolvePickingAction(
  patch: OrderItemPickingPatch,
  currentItem: OrderItem
): PickingAuditLog["action"] {
  if (patch.action) return patch.action;
  if (
    patch.pickingStatus !== undefined &&
    patch.pickingStatus !== currentItem.pickingStatus
  ) {
    return patch.pickingStatus;
  }
  if (
    patch.cantidadAlistada !== undefined &&
    patch.cantidadAlistada !== currentItem.cantidadAlistada
  ) {
    return "CANTIDAD_AJUSTADA";
  }
  if (
    patch.pickerNote !== undefined &&
    patch.pickerNote !== currentItem.pickerNote
  ) {
    return "NOTA_EDITADA";
  }
  return patch.pickingStatus ?? currentItem.pickingStatus ?? "PENDIENTE_REVISION";
}
