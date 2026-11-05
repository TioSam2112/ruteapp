"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentUserProfile,
  getUserFullName,
  subscribeToActiveSessions,
  subscribeToReadyOrders,
  type DeliverySession,
  type Order,
  type UserProfile,
} from "@rutea/shared";
import type { DispatchTabMode } from "@/types/dispatch";
import {
  calculateDispatchSelectionSummary,
  groupReadyOrdersByCity,
} from "@/utils/dispatch";

export function useDispatchDashboard() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [activeSessions, setActiveSessions] = useState<DeliverySession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DispatchTabMode>("POR_DESPACHAR");
  const [selectedCities, setSelectedCities] = useState<Set<string>>(
    () => new Set()
  );
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);

  useEffect(() => {
    getCurrentUserProfile().then((profile) => {
      if (profile) setCurrentUser(profile);
    });
  }, []);

  useEffect(() => {
    let ordersLoaded = false;
    let sessionsLoaded = false;

    const unsubOrders = subscribeToReadyOrders(
      (orders) => {
        setReadyOrders(orders);
        ordersLoaded = true;
        if (ordersLoaded && sessionsLoaded) setLoading(false);
      },
      (err) => {
        setError(err.message || "Error al sincronizar facturas listas.");
        setLoading(false);
      }
    );

    const unsubSessions = subscribeToActiveSessions(
      (sessions) => {
        setActiveSessions(sessions);
        sessionsLoaded = true;
        if (ordersLoaded && sessionsLoaded) setLoading(false);
      },
      (err) => {
        setError(err.message || "Error al sincronizar sesiones de reparto.");
        setLoading(false);
      }
    );

    return () => {
      unsubOrders();
      unsubSessions();
    };
  }, []);

  const cityGroups = useMemo(
    () => groupReadyOrdersByCity(readyOrders),
    [readyOrders]
  );

  const validSelectedCities = useMemo(() => {
    const available = new Set(cityGroups.map((g) => g.ciudad));
    const filtered = new Set<string>();
    for (const city of selectedCities) {
      if (available.has(city)) {
        filtered.add(city);
      }
    }
    return filtered;
  }, [cityGroups, selectedCities]);

  const selectionSummary = useMemo(
    () => calculateDispatchSelectionSummary(cityGroups, validSelectedCities),
    [cityGroups, validSelectedCities]
  );

  const toggleCitySelection = useCallback((ciudad: string) => {
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (next.has(ciudad)) {
        next.delete(ciudad);
      } else {
        next.add(ciudad);
      }
      return next;
    });
  }, []);

  const selectAllCities = useCallback(() => {
    setSelectedCities(new Set(cityGroups.map((group) => group.ciudad)));
  }, [cityGroups]);

  const clearSelection = useCallback(() => {
    setSelectedCities(new Set());
  }, []);

  const handleSessionCreated = useCallback(() => {
    setSelectedCities(new Set());
    setIsCreateRouteModalOpen(false);
    setActiveTab("RUTAS_ACTIVAS");
  }, []);

  const creatorIdentity = useMemo(
    () => ({
      uid: currentUser?.uid ?? "admin",
      nombre: currentUser ? getUserFullName(currentUser) : "Administrador",
    }),
    [currentUser]
  );

  return {
    loading,
    error,
    activeTab,
    setActiveTab,
    cityGroups,
    activeSessions,
    selectedCities: validSelectedCities,
    selectionSummary,
    inspectedOrder,
    openInspectOrder: setInspectedOrder,
    closeInspectOrder: () => setInspectedOrder(null),
    isCreateRouteModalOpen,
    openCreateRouteModal: () => setIsCreateRouteModalOpen(true),
    closeCreateRouteModal: () => setIsCreateRouteModalOpen(false),
    toggleCitySelection,
    selectAllCities,
    clearSelection,
    handleSessionCreated,
    creatorIdentity,
  };
}

