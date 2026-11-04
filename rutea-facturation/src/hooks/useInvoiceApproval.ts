"use client";

import { useState } from "react";
import { approveOrderForDelivery } from "@rutea/shared";
import type { Order, PickingAuditUser } from "@rutea/shared";

interface UseInvoiceApprovalParams {
  order: Order;
  sellerAudit?: PickingAuditUser;
  onOrderApproved?: (updatedOrder: Order) => void;
}

export function useInvoiceApproval({
  order,
  sellerAudit,
  onOrderApproved,
}: UseInvoiceApprovalParams) {
  const [isApproving, setIsApproving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canSendToDelivery = order.estado === "ALISTADO";
  const isAlreadyDispatched =
    order.estado === "LISTO_PARA_REPARTO" ||
    order.estado === "EN_RUTA" ||
    order.estado === "ENTREGADO";

  const handleSendToDelivery = async () => {
    if (!canSendToDelivery) return;
    setActionError(null);
    setIsApproving(true);

    try {
      const updated = await approveOrderForDelivery(order.id, sellerAudit);
      onOrderApproved?.(updated);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No se pudo aprobar la factura para reparto."
      );
    } finally {
      setIsApproving(false);
    }
  };

  return {
    isApproving,
    actionError,
    canSendToDelivery,
    isAlreadyDispatched,
    handleSendToDelivery,
  };
}

