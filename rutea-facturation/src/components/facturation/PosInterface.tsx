"use client";

import { useEffect, useRef } from "react";
import { Edit3, Warehouse, X } from "lucide-react";
import { ClientSelectorFact } from "@/components/facturation/ClientSelectorFact";
import { ProductOptionsModal } from "@/components/facturation/ProductOptionsModal";
import { PosProductSearchBar } from "@/components/facturation/PosProductSearchBar";
import { PosOrderItemsList } from "@/components/facturation/PosOrderItemsList";
import { PosOrderSummaryCard } from "@/components/facturation/PosOrderSummaryCard";
import { PosOrderSuccessModal } from "@/components/facturation/PosOrderSuccessModal";
import { usePosCart } from "@/hooks/usePosCart";
import { usePosCheckout } from "@/hooks/usePosCheckout";
import type { Order, UserProfile } from "@rutea/shared";
import type { Client } from "@/types/client";

interface PosInterfaceProps {
  currentUser: UserProfile;
  clients?: Client[];
  onClientCreated?: (newClient: Client) => void;
  onClientsLoaded?: (clients: Client[]) => void;
  editingOrder?: Order | null;
  onCancelEdit?: () => void;
  onBackToInvoices?: () => void;
}

export function PosInterface({
  currentUser,
  clients,
  onClientCreated,
  onClientsLoaded,
  editingOrder = null,
  onCancelEdit,
  onBackToInvoices,
}: PosInterfaceProps) {
  const cart = usePosCart();
  const checkout = usePosCheckout({
    currentUser,
    orderItems: cart.orderItems,
    totalBase: cart.totalBase,
    totalTax: cart.totalTax,
    total: cart.total,
    onResetCart: cart.resetCart,
    editingOrder,
    clientData: cart.clientData,
    setClientData: cart.setClientData,
    generalObservation: cart.generalObservation,
    setGeneralObservation: cart.setGeneralObservation,
  });

  const loadedOrderIdRef = useRef<string | null>(null);
  const { loadOrderForEdit } = cart;

  useEffect(() => {
    if (editingOrder && loadedOrderIdRef.current !== editingOrder.id) {
      loadedOrderIdRef.current = editingOrder.id;
      loadOrderForEdit(editingOrder, clients ?? []);
    } else if (!editingOrder && loadedOrderIdRef.current !== null) {
      loadedOrderIdRef.current = null;
    }
  }, [editingOrder, clients, loadOrderForEdit]);

  const isInWarehouse =
    editingOrder?.estado === "EN_ALISTAMIENTO" || editingOrder?.estado === "ALISTADO";

  const handleCancelEditClick = () => {
    checkout.handleResetOrder();
    onCancelEdit?.();
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl w-full mx-auto p-3 sm:p-6 pb-24">
      {editingOrder && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 backdrop-blur-md ${
            isInWarehouse
              ? "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              : "border-primary/30 bg-primary/10 text-foreground"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isInWarehouse
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {isInWarehouse ? <Warehouse size={18} /> : <Edit3 size={18} />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  Editando Factura #{editingOrder.facturaNumber}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    isInWarehouse
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200"
                      : "border-primary/30 bg-primary/15 text-primary"
                  }`}
                >
                  {isInWarehouse
                    ? "En bodega (se preservará el avance de alistamiento)"
                    : "En bodega (pendiente de alistamiento)"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Puedes cambiar el cliente, añadir nuevos productos o ajustar cantidades existentes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelEditClick}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent active:scale-95"
          >
            <X size={14} />
            <span>Cancelar edición</span>
          </button>
        </div>
      )}

      <ClientSelectorFact
        selectedClient={checkout.clientData}
        onSelectClient={checkout.setClientData}
        onClientCreated={onClientCreated}
        initialClients={clients}
        onClientsLoaded={onClientsLoaded}
      />

      <PosProductSearchBar
        inputRef={cart.searchInputRef}
        searchQuery={cart.searchQuery}
        onSearchQueryChange={cart.handleSearchQueryChange}
        onClear={cart.clearSearch}
        onKeyDown={cart.handleSearchKeyDown}
        onFocus={() => cart.searchResults.length > 0 && cart.setIsDropdownOpen(true)}
        isDropdownOpen={cart.isDropdownOpen}
        results={cart.searchResults}
        selectedIndex={cart.selectedIndex}
        onHoverIndex={cart.setSelectedIndex}
        onSelectProduct={cart.handleSelectProduct}
      />

      <div className="flex flex-col lg:flex-row gap-5">
        <PosOrderItemsList
          items={cart.orderItems}
          onReset={checkout.handleResetOrder}
          onUpdateQuantity={cart.handleUpdateQuantity}
          onEdit={cart.handleEditItem}
          onRemove={cart.handleRemoveItem}
        />

        <PosOrderSummaryCard
          generalObservation={checkout.generalObservation}
          onObservationChange={checkout.setGeneralObservation}
          totalBase={cart.totalBase}
          totalTax={cart.totalTax}
          total={cart.total}
          submitError={checkout.submitError}
          isSubmitting={checkout.isSubmitting}
          isEmpty={cart.orderItems.length === 0}
          isEditing={Boolean(editingOrder)}
          onSubmit={checkout.handleCompleteOrder}
        />
      </div>

      <ProductOptionsModal
        isOpen={Boolean(cart.selectedProductForModal)}
        product={cart.selectedProductForModal}
        initialItem={cart.editingItemIndex !== null ? cart.orderItems[cart.editingItemIndex] : null}
        onClose={cart.handleCloseModal}
        onConfirm={cart.handleConfirmItem}
      />

      {checkout.completedOrder && (
        <PosOrderSuccessModal
          order={checkout.completedOrder}
          isEditing={Boolean(editingOrder)}
          onReset={handleCancelEditClick}
          onBackToInvoices={onBackToInvoices}
        />
      )}
    </div>
  );
}
