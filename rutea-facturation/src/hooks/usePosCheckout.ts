"use client";

import { useState } from "react";
import { createOrder, useEscapeKey } from "@rutea/shared";
import type { ClientOrderData, Order, OrderItem, UserProfile } from "@rutea/shared";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";

interface UsePosCheckoutParams {
  currentUser: UserProfile;
  orderItems: OrderItem[];
  totalBase: number;
  totalTax: number;
  total: number;
  onResetCart: () => void;
}

export function usePosCheckout({
  currentUser,
  orderItems,
  totalBase,
  totalTax,
  total,
  onResetCart,
}: UsePosCheckoutParams) {
  const [clientData, setClientData] = useState<ClientOrderData & { id: string }>(
    DEFAULT_CONSUMIDOR_FINAL
  );
  const [generalObservation, setGeneralObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleResetOrder = () => {
    setGeneralObservation("");
    setClientData(DEFAULT_CONSUMIDOR_FINAL);
    setSubmitError(null);
    setCompletedOrder(null);
    onResetCart();
  };

  useEscapeKey(Boolean(completedOrder), () => handleResetOrder());

  const handleCompleteOrder = async () => {
    if (orderItems.length === 0) {
      setSubmitError("Debes agregar al menos un ítem a la orden para facturar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createOrder({
        facturaNumber: "",
        id_cliente: clientData.id,
        clientData: {
          nombre: clientData.nombre,
          nit: clientData.nit,
          telefono: clientData.telefono,
          direccion: clientData.direccion,
          ciudad: clientData.ciudad,
        },
        id_vendedor: currentUser.uid,
        vendedorNombre: currentUser.nombre
          ? `${currentUser.nombre} ${currentUser.apellido ?? ""}`.trim()
          : currentUser.email,
        items: orderItems,
        generalObservation: generalObservation.trim() || undefined,
        totalBase,
        totalTax,
        total,
        estado: "PENDIENTE_ALISTAMIENTO",
      });

      setCompletedOrder(created);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setSubmitError(error?.message || "Ocurrió un error al persistir la orden en Firestore.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    clientData,
    setClientData,
    generalObservation,
    setGeneralObservation,
    isSubmitting,
    completedOrder,
    submitError,
    handleResetOrder,
    handleCompleteOrder,
  };
}

