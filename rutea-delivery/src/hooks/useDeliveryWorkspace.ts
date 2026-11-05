"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUserProfile,
  subscribeToSessionOrders,
  subscribeToUserDeliverySession,
  updateDeliverySessionStatus,
  type DeliverySession,
  type Order,
  type UserProfile,
} from "@rutea/shared";
import { ALL_ROUTE_CITIES_FILTER } from "@/constants/delivery";
import {
  buildCrewDisplayList,
  calculateDeliveryRouteProgress,
  formatCompanionsSummary,
  groupSessionOrdersByCity,
} from "@/utils/delivery";

export function useDeliveryWorkspace() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<DeliverySession | null>(null);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>(
    ALL_ROUTE_CITIES_FILTER
  );
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [activeCollectionOrderId, setActiveCollectionOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let active = true;

    getCurrentUserProfile(["admin", "delivery"]).then((profile) => {
      if (!active) return;
      if (!profile) {
        setLoadingSession(false);
        return;
      }
      setCurrentUser(profile);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserDeliverySession(
      currentUser.uid,
      (matchedSession) => {
        setSession(matchedSession);
        setLoadingSession(false);

        if (matchedSession && matchedSession.estado === "ASIGNADA") {
          updateDeliverySessionStatus(matchedSession.id, "EN_CURSO").catch(
            () => undefined
          );
        }
      },
      (err) => {
        setError(
          err.message || "No se pudo sincronizar la sesión de reparto asignada."
        );
        setLoadingSession(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!session?.id) return;

    const unsubscribe = subscribeToSessionOrders(
      session.id,
      (orders) => {
        setSessionOrders(orders);
        setLoadingOrders(false);
      },
      (err) => {
        setError(
          err.message || "Error al sincronizar las facturas de la ruta."
        );
        setLoadingOrders(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [session?.id]);

  const effectiveSessionOrders = useMemo(
    () => (session?.id ? sessionOrders : []),
    [session?.id, sessionOrders]
  );

  const crewMembers = useMemo(
    () =>
      session
        ? buildCrewDisplayList(session.assignedCrew, currentUser?.uid)
        : [],
    [session, currentUser?.uid]
  );

  const companionsSummary = useMemo(
    () => (session ? formatCompanionsSummary(session.assignedCrew) : ""),
    [session]
  );

  const routeProgress = useMemo(
    () => calculateDeliveryRouteProgress(effectiveSessionOrders, session),
    [effectiveSessionOrders, session]
  );

  const cityGroups = useMemo(
    () =>
      session
        ? groupSessionOrdersByCity(effectiveSessionOrders, session.poblaciones)
        : [],
    [effectiveSessionOrders, session]
  );

  const validSelectedCity = useMemo(() => {
    if (selectedCity === ALL_ROUTE_CITIES_FILTER) {
      return ALL_ROUTE_CITIES_FILTER;
    }
    const exists = cityGroups.some((g) => g.ciudad === selectedCity);
    return exists ? selectedCity : ALL_ROUTE_CITIES_FILTER;
  }, [cityGroups, selectedCity]);

  const visibleCityGroups = useMemo(() => {
    if (validSelectedCity === ALL_ROUTE_CITIES_FILTER) {
      return cityGroups;
    }
    return cityGroups.filter((group) => group.ciudad === validSelectedCity);
  }, [cityGroups, validSelectedCity]);

  return {
    currentUser,
    session,
    loading: loadingSession || loadingOrders,
    error,
    crewMembers,
    companionsSummary,
    routeProgress,
    cityGroups,
    visibleCityGroups,
    selectedCity: validSelectedCity,
    setSelectedCity,
    inspectedOrder,
    openInspectOrder: setInspectedOrder,
    closeInspectOrder: () => setInspectedOrder(null),
    activeCollectionOrderId,
    toggleCollectionCard: (orderId: string) =>
      setActiveCollectionOrderId((prev) => (prev === orderId ? null : orderId)),
  };
}

