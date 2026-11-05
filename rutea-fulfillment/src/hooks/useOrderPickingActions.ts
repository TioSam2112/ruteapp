"use client";

import { useState } from "react";
import {
  completeOrderFulfillment,
  reopenOrderFulfillment,
  toggleGeneralObservationCheck,
  updateOrderItemPicking,
  type ItemPickingStatus,
  type Order,
  type OrderItem,
  type OrderItemPickingPatch,
  type PickingAuditUser,
} from "@rutea/shared";
import {
  formatPickingAuditTrail,
  getEffectiveItemPickedQuantity,
  getItemPickingStatus,
} from "@/utils/fulfillment";

export interface UseOrderPickingActionsParams {
  order: Order;
  auditUser: PickingAuditUser;
  onOrderCompleted?: (orderId: string) => void;
  onOrderReopened?: (orderId: string) => void;
}

export function useOrderPickingActions({
  order,
  auditUser,
  onOrderCompleted,
  onOrderReopened,
}: UseOrderPickingActionsParams) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isTogglingObs, setIsTogglingObs] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isGeneralObsChecked = Boolean(order.generalObservationChecked);

  const handleUpdateItem = async (
    itemIndex: number,
    patch: OrderItemPickingPatch
  ) => {
    setActionError(null);
    try {
      await updateOrderItemPicking(order.id, itemIndex, patch, auditUser);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el producto en Firestore."
      );
    }
  };

  const handleToggleGeneralObservation = async () => {
    setActionError(null);
    setIsTogglingObs(true);
    try {
      await toggleGeneralObservationCheck(
        order.id,
        !isGeneralObsChecked,
        auditUser
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la observación general."
      );
    } finally {
      setIsTogglingObs(false);
    }
  };

  const handleCompleteFulfillment = async () => {
    setActionError(null);
    setIsCompleting(true);
    try {
      await completeOrderFulfillment(order.id, auditUser);
      onOrderCompleted?.(order.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo finalizar el alistamiento de la factura."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReopenOrder = async () => {
    setActionError(null);
    setIsReopening(true);
    try {
      await reopenOrderFulfillment(order.id, auditUser);
      onOrderReopened?.(order.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo reabrir la factura para alistamiento."
      );
    } finally {
      setIsReopening(false);
    }
  };

  return {
    isCompleting,
    isReopening,
    isTogglingObs,
    actionError,
    handleUpdateItem,
    handleToggleGeneralObservation,
    handleCompleteFulfillment,
    handleReopenOrder,
  };
}

export interface UsePickingItemActionsParams {
  item: OrderItem;
  itemIndex: number;
  onUpdateItem: (
    itemIndex: number,
    patch: OrderItemPickingPatch
  ) => Promise<void>;
}

export function usePickingItemActions({
  item,
  itemIndex,
  onUpdateItem,
}: UsePickingItemActionsParams) {
  const currentStatus = getItemPickingStatus(item);
  const effectiveQty = getEffectiveItemPickedQuantity(item);

  const [draftQty, setDraftQty] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(
    Boolean(item.pickerNote?.trim())
  );
  const [isSaving, setIsSaving] = useState(false);

  const displayedQty = draftQty !== null ? draftQty : String(effectiveQty);
  const displayedNote = draftNote !== null ? draftNote : (item.pickerNote ?? "");
  const auditText = formatPickingAuditTrail(item.lastPickedBy);
  const showNoteEditor = isNoteOpen || Boolean(item.pickerNote?.trim());
  const hasDraftNote = draftNote !== null;

  const runUpdate = async (patch: OrderItemPickingPatch) => {
    setIsSaving(true);
    try {
      await onUpdateItem(itemIndex, patch);
    } finally {
      setIsSaving(false);
    }
  };

  const parseDraftQuantity = (): number => {
    if (draftQty === null) return effectiveQty;
    const normalized = draftQty.replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed) || parsed < 0) {
      return effectiveQty;
    }
    return parsed;
  };

  const handleCommitQuantity = async () => {
    if (draftQty === null) return;
    const nextQty = parseDraftQuantity();
    setDraftQty(null);

    if (nextQty === effectiveQty) return;

    await runUpdate({
      cantidadAlistada: nextQty,
      action: "CANTIDAD_AJUSTADA",
    });
  };

  const handleSelectStatus = async (targetStatus: ItemPickingStatus) => {
    const currentParsedQty = parseDraftQuantity();
    setDraftQty(null);

    if (targetStatus === "AGOTADO") {
      await runUpdate({
        pickingStatus: "AGOTADO",
        cantidadAlistada: 0,
        action: "AGOTADO",
      });
      return;
    }

    const restoredQty =
      targetStatus === "ALISTADO" && currentParsedQty === 0
        ? item.cantidad
        : currentParsedQty;

    await runUpdate({
      pickingStatus: targetStatus,
      cantidadAlistada: restoredQty,
      action: targetStatus,
    });
  };

  const handleSaveNote = async () => {
    if (draftNote === null) return;
    const trimmed = draftNote.trim();
    const previous = (item.pickerNote ?? "").trim();
    setDraftNote(null);

    if (trimmed === previous) {
      if (!trimmed) setIsNoteOpen(false);
      return;
    }

    await runUpdate({
      pickerNote: trimmed,
      action: "NOTA_EDITADA",
    });

    if (!trimmed) {
      setIsNoteOpen(false);
    }
  };

  return {
    currentStatus,
    displayedQty,
    displayedNote,
    auditText,
    showNoteEditor,
    hasDraftNote,
    isSaving,
    setDraftQty,
    setDraftNote,
    openNoteEditor: () => setIsNoteOpen(true),
    handleCommitQuantity,
    handleSelectStatus,
    handleSaveNote,
  };
}
