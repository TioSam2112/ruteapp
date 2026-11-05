"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createDeliverySession,
  getUserFullName,
  getUsers,
  type DeliveryCrewMember,
  type UserProfile,
} from "@rutea/shared";
import type { DispatchSelectionSummary } from "@/types/dispatch";

interface UseCreateRouteSessionOptions {
  isOpen: boolean;
  selectionSummary: DispatchSelectionSummary;
  creator: { uid: string; nombre: string };
  onSuccess: (sessionId: string) => void;
}

export function useCreateRouteSession({
  isOpen,
  selectionSummary,
  creator,
  onSuccess,
}: UseCreateRouteSessionOptions) {
  const [deliveryUsers, setDeliveryUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedCrewUids, setSelectedCrewUids] = useState<Set<string>>(
    () => new Set()
  );
  const [nombreRuta, setNombreRuta] = useState(
    () => selectionSummary.suggestedRouteName
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setNombreRuta(selectionSummary.suggestedRouteName);
      setSelectedCrewUids(new Set());
      setError(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoadingUsers(true);

    getUsers()
      .then((users) => {
        if (!active) return;
        const activeDelivery = users.filter((u) => u.rol === "delivery");
        setDeliveryUsers(activeDelivery);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo cargar la lista de entregadores.";
        setError(msg);
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  const toggleCrewMember = useCallback((uid: string) => {
    setSelectedCrewUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedRouteName =
      nombreRuta.trim() || selectionSummary.suggestedRouteName;
    if (!trimmedRouteName) {
      setError("Ingresa un nombre para identificar la ruta.");
      return;
    }

    const assignedCrew: DeliveryCrewMember[] = deliveryUsers
      .filter((u) => selectedCrewUids.has(u.uid))
      .map((u) => ({
        uid: u.uid,
        nombre: getUserFullName(u),
        ...(u.email ? { email: u.email } : {}),
      }));

    if (assignedCrew.length === 0) {
      setError("Selecciona al menos un entregador para asignar la cuadrilla.");
      return;
    }

    if (selectionSummary.selectedOrders.length === 0) {
      setError("No hay facturas disponibles en las poblaciones seleccionadas.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const sessionId = await createDeliverySession(
        {
          nombreRuta: trimmedRouteName,
          poblaciones: selectionSummary.selectedCities,
          assignedCrew,
          orders: selectionSummary.selectedOrders,
        },
        creator
      );
      onSuccess(sessionId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al crear la sesión de reparto.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    creator,
    deliveryUsers,
    nombreRuta,
    onSuccess,
    selectedCrewUids,
    selectionSummary,
  ]);

  return {
    deliveryUsers,
    loadingUsers,
    selectedCrewUids,
    nombreRuta,
    setNombreRuta,
    submitting,
    error,
    toggleCrewMember,
    handleSubmit,
  };
}

