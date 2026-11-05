"use client";

import { ClientSelectorFact } from "@/components/facturation/ClientSelectorFact";
import { ProductOptionsModal } from "@/components/facturation/ProductOptionsModal";
import { PosProductSearchBar } from "@/components/facturation/PosProductSearchBar";
import { PosOrderItemsList } from "@/components/facturation/PosOrderItemsList";
import { PosOrderSummaryCard } from "@/components/facturation/PosOrderSummaryCard";
import { PosOrderSuccessModal } from "@/components/facturation/PosOrderSuccessModal";
import { usePosCart } from "@/hooks/usePosCart";
import { usePosCheckout } from "@/hooks/usePosCheckout";
import type { UserProfile } from "@rutea/shared";
import type { Client } from "@/types/client";

interface PosInterfaceProps {
  currentUser: UserProfile;
  clients?: Client[];
  onClientCreated?: (newClient: Client) => void;
  onClientsLoaded?: (clients: Client[]) => void;
}

export function PosInterface({
  currentUser,
  clients,
  onClientCreated,
  onClientsLoaded,
}: PosInterfaceProps) {
  const cart = usePosCart();
  const checkout = usePosCheckout({
    currentUser,
    orderItems: cart.orderItems,
    totalBase: cart.totalBase,
    totalTax: cart.totalTax,
    total: cart.total,
    onResetCart: cart.resetCart,
  });

  return (
    <div className="flex flex-col gap-5 max-w-6xl w-full mx-auto p-3 sm:p-6 pb-24">
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
        onFocus={() => {
          if (cart.searchResults.length > 0) cart.setIsDropdownOpen(true);
        }}
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
          onSubmit={checkout.handleCompleteOrder}
        />
      </div>

      <ProductOptionsModal
        isOpen={Boolean(cart.selectedProductForModal)}
        product={cart.selectedProductForModal}
        initialItem={
          cart.editingItemIndex !== null ? cart.orderItems[cart.editingItemIndex] : null
        }
        onClose={cart.handleCloseModal}
        onConfirm={cart.handleConfirmItem}
      />

      {checkout.completedOrder && (
        <PosOrderSuccessModal order={checkout.completedOrder} onReset={checkout.handleResetOrder} />
      )}
    </div>
  );
}
