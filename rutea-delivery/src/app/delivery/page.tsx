"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { ReadOnlyInvoiceDetailModal } from "@/components/admin/dispatch/ReadOnlyInvoiceDetailModal";
import { AssignedRouteInvoicesList } from "@/components/delivery/AssignedRouteInvoicesList";
import { DeliverySessionHeader } from "@/components/delivery/DeliverySessionHeader";
import { useDeliveryWorkspace } from "@/hooks/useDeliveryWorkspace";

export default function DeliveryWorkspacePage() {
  const {
    session,
    loading,
    error,
    crewMembers,
    companionsSummary,
    routeProgress,
    cityGroups,
    visibleCityGroups,
    selectedCity,
    setSelectedCity,
    inspectedOrder,
    openInspectOrder,
    closeInspectOrder,
    activeCollectionOrderId,
    toggleCollectionCard,
  } = useDeliveryWorkspace();

  if (loading && !session) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs font-medium tracking-tight">
            Sincronizando sesión de reparto…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DeliverySessionHeader
        session={session}
        crewMembers={crewMembers}
        companionsSummary={companionsSummary}
        progress={routeProgress}
      />

      {session && (
        <AssignedRouteInvoicesList
          cityGroups={cityGroups}
          visibleCityGroups={visibleCityGroups}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onInspectOrder={openInspectOrder}
          activeCollectionOrderId={activeCollectionOrderId}
          onToggleCollectionCard={toggleCollectionCard}
        />
      )}

      <ReadOnlyInvoiceDetailModal
        order={inspectedOrder}
        onClose={closeInspectOrder}
      />
    </div>
  );
}
