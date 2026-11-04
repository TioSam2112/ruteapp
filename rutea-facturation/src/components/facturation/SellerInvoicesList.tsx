"use client";

import { useMemo, useState } from "react";
import { ReceiptText } from "lucide-react";
import type { Order, PickingAuditUser } from "@rutea/shared";
import { InvoiceComparisonDetail } from "@/components/facturation/InvoiceComparisonDetail";
import { SellerInvoicesToolbar } from "@/components/facturation/SellerInvoicesToolbar";
import { SellerInvoicesCityGroup } from "@/components/facturation/SellerInvoicesCityGroup";
import {
  filterSellerOrders,
  getSellerInvoiceFilterCounts,
  groupSellerOrdersByCity,
  type SellerInvoiceFilterMode,
} from "@/utils/reliquidation";

export interface SellerInvoicesListProps {
  orders: readonly Order[];
  isLoading?: boolean;
  sellerAudit?: PickingAuditUser;
  selectedOrderId?: string | null;
  onSelectOrder?: (order: Order | null) => void;
  renderDetailPanel?: (order: Order, onClose: () => void) => React.ReactNode;
}

export function SellerInvoicesList({
  orders,
  isLoading = false,
  sellerAudit,
  selectedOrderId: controlledSelectedId,
  onSelectOrder,
  renderDetailPanel,
}: SellerInvoicesListProps) {
  const [filterMode, setFilterMode] = useState<SellerInvoiceFilterMode>("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const activeSelectedId =
    controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const handleSelect = (order: Order | null) => {
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(order?.id ?? null);
    }
    onSelectOrder?.(order);
  };

  const counts = useMemo(() => getSellerInvoiceFilterCounts(orders), [orders]);

  const filteredOrders = useMemo(() => {
    const byMode = filterSellerOrders(orders, filterMode);
    const q = searchTerm.trim().toLowerCase();
    if (!q) return byMode;

    return byMode.filter(
      (o) =>
        o.facturaNumber.toLowerCase().includes(q) ||
        o.clientData.nombre.toLowerCase().includes(q) ||
        (o.clientData.ciudad && o.clientData.ciudad.toLowerCase().includes(q)) ||
        (o.clientData.nit && o.clientData.nit.toLowerCase().includes(q))
    );
  }, [orders, filterMode, searchTerm]);

  const cityGroups = useMemo(() => groupSellerOrdersByCity(filteredOrders), [filteredOrders]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === activeSelectedId) ?? null,
    [orders, activeSelectedId]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background lg:flex-row">
      <div
        className={`flex h-full w-full flex-col overflow-hidden border-border/40 bg-background transition-all ${
          selectedOrder
            ? "hidden lg:flex lg:w-[460px] lg: shrink-0 lg:border-r xl:w-[520px]"
            : "flex flex-1"
        }`}
      >
        <SellerInvoicesToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          counts={counts}
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-28 animate-pulse rounded-2xl border border-border/40 bg-card/60"
                />
              ))}
            </div>
          ) : cityGroups.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
                <ReceiptText size={22} strokeWidth={1.6} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No hay facturas en esta vista
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                No se encontraron facturas para el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cityGroups.map((group) => (
                <SellerInvoicesCityGroup
                  key={group.ciudad}
                  group={group}
                  hasSelection={Boolean(selectedOrder)}
                  activeSelectedId={activeSelectedId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <aside
          aria-label="Detalle comparativo de factura"
          className="flex h-full flex-1 flex-col overflow-y-auto bg-background"
        >
          {renderDetailPanel ? (
            renderDetailPanel(selectedOrder, () => handleSelect(null))
          ) : (
            <InvoiceComparisonDetail
              order={selectedOrder}
              sellerAudit={sellerAudit}
              onClose={() => handleSelect(null)}
            />
          )}
        </aside>
      )}
    </div>
  );
}
