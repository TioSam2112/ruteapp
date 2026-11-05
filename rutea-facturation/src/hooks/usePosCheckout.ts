"use client";

import { useState } from "react";
import { createOrder, updateOrderFromFacturation, useEscapeKey } from "@rutea/shared";
import type { ClientOrderData, Order, OrderItem, UserProfile } from "@rutea/shared";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";

interface UsePosCheckoutParams {
  currentUser: UserProfile;
  orderItems: OrderItem[];
  totalBase: number;
  totalTax: number;
  total: number;
  onResetCart: () => void;
  editingOrder?: Order | null;
  clientData?: ClientOrderData & { id: string };
  setClientData?: (client: ClientOrderData & { id: string }) => void;
  generalObservation?: string;
  setGeneralObservation?: (value: string) => void;
}

export function usePosCheckout({
  currentUser,
  orderItems,
  totalBase,
  totalTax,
  total,
  onResetCart,
  editingOrder = null,
  clientData: externalClientData,
  setClientData: externalSetClientData,
  generalObservation: externalObservation,
  setGeneralObservation: externalSetObservation,
}: UsePosCheckoutParams) {
  const [internalClientData, setInternalClientData] = useState<ClientOrderData & { id: string }>(
    DEFAULT_CONSUMIDOR_FINAL
  );
  const [internalObservation, setInternalObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clientData = externalClientData ?? internalClientData;
  const setClientData = externalSetClientData ?? setInternalClientData;
  const generalObservation = externalObservation ?? internalObservation;
  const setGeneralObservation = externalSetObservation ?? setInternalObservation;

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

    const sellerName = currentUser.nombre
      ? `${currentUser.nombre} ${currentUser.apellido ?? ""}`.trim()
      : currentUser.email;

    const normalizedClientData: ClientOrderData = {
      nombre: clientData.nombre,
      nit: clientData.nit,
      telefono: clientData.telefono,
      direccion: clientData.direccion,
      ciudad: clientData.ciudad,
    };

    try {
      if (editingOrder) {
        const updated = await updateOrderFromFacturation(
          editingOrder.id,
          {
            id_cliente: clientData.id,
            clientData: normalizedClientData,
            items: orderItems,
            generalObservation: generalObservation.trim() || undefined,
            totalBase,
            totalTax,
            total,
          },
          {
            uid: currentUser.uid,
            userName: sellerName,
          }
        );
        setCompletedOrder(updated);
      } else {
        const created = await createOrder({
          facturaNumber: "",
          id_cliente: clientData.id,
          clientData: normalizedClientData,
          id_vendedor: currentUser.uid,
          vendedorNombre: sellerName,
          items: orderItems,
          generalObservation: generalObservation.trim() || undefined,
          totalBase,
          totalTax,
          total,
          estado: "PENDIENTE_ALISTAMIENTO",
        });
        setCompletedOrder(created);
      }
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
