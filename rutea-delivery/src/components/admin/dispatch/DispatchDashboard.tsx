"use client";

import {
  AlertCircle,
  CheckSquare,
  PackageCheck,
  Square,
  Truck,
} from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import { ActiveSessionsPanel } from "@/components/admin/dispatch/ActiveSessionsPanel";
import { CreateRouteSessionModal } from "@/components/admin/dispatch/CreateRouteSessionModal";
import { DispatchCityGroupCard } from "@/components/admin/dispatch/DispatchCityGroupCard";
import { DispatchStickyBottomBar } from "@/components/admin/dispatch/DispatchStickyBottomBar";
import { ReadOnlyInvoiceDetailModal } from "@/components/admin/dispatch/ReadOnlyInvoiceDetailModal";
import { DISPATCH_TAB_OPTIONS } from "@/constants/dispatch";
import { useDispatchDashboard } from "@/hooks/useDispatchDashboard";

export function DispatchDashboard() {
  const {
    loading,
    error,
    activeTab,
    setActiveTab,
    cityGroups,
    activeSessions,
    selectedCities,
    selectionSummary,
    inspectedOrder,
    openInspectOrder,
    closeInspectOrder,
    isCreateRouteModalOpen,
    openCreateRouteModal,
    closeCreateRouteModal,
    toggleCitySelection,
    selectAllCities,
    clearSelection,
    handleSessionCreated,
    creatorIdentity,
  } = useDispatchDashboard();

  const totalReadyInvoices = cityGroups.reduce(
    (sum, group) => sum + group.totalFacturas,
    0
  );
  const totalReadyAmount = cityGroups.reduce(
    (sum, group) => sum + group.totalMontoEsperado,
    0
  );
  const allSelected =
    cityGroups.length > 0 && selectedCities.size === cityGroups.length;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 p-4 pb-16 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Centro de Despacho & Rutas Logísticas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrupa facturas listas por población, audita el alistamiento en solo
            lectura y asigna cuadrillas de reparto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-border/50 bg-card px-4 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Por Despachar
            </p>
            <p className="text-sm font-semibold text-foreground">
              {totalReadyInvoices} fact. • {formatPosCurrency(totalReadyAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card px-4 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Rutas Activas
            </p>
            <p className="text-sm font-semibold text-primary">
              {activeSessions.length} en operación
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex flex-wrap gap-2">
          {DISPATCH_TAB_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "POR_DESPACHAR"
                ? totalReadyInvoices
                : activeSessions.length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-4 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border/50 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.id === "POR_DESPACHAR" ? (
                  <PackageCheck size={15} />
                ) : (
                  <Truck size={15} />
                )}
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "POR_DESPACHAR" && cityGroups.length > 0 && (
          <button
            type="button"
            onClick={allSelected ? clearSelection : selectAllCities}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
            <span>
              {allSelected
                ? "Deseleccionar todas"
                : "Seleccionar todas las poblaciones"}
            </span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : activeTab === "RUTAS_ACTIVAS" ? (
        <ActiveSessionsPanel sessions={activeSessions} />
      ) : cityGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <PackageCheck size={22} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">
            No hay facturas pendientes de despacho
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Cuando facturación autorice facturas alistadas como &ldquo;Listo
            para Reparto&rdquo;, aparecerán aquí agrupadas por población.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cityGroups.map((group) => (
            <DispatchCityGroupCard
              key={group.ciudad}
              group={group}
              isSelected={selectedCities.has(group.ciudad)}
              onToggleSelect={toggleCitySelection}
              onInspectOrder={openInspectOrder}
            />
          ))}
        </div>
      )}

      {activeTab === "POR_DESPACHAR" && (
        <DispatchStickyBottomBar
          selectionSummary={selectionSummary}
          onClearSelection={clearSelection}
          onOpenCreateRoute={openCreateRouteModal}
        />
      )}

      <ReadOnlyInvoiceDetailModal
        order={inspectedOrder}
        onClose={closeInspectOrder}
      />

      <CreateRouteSessionModal
        isOpen={isCreateRouteModalOpen}
        selectionSummary={selectionSummary}
        creator={creatorIdentity}
        onClose={closeCreateRouteModal}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
}

