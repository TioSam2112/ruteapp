"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageSearch, AlertCircle } from "lucide-react";
import {
  getCurrentUserProfile,
  subscribeToFulfillmentOrders,
  type Order,
  type UserProfile,
} from "@rutea/shared";
import { buildPickingAuditUser } from "@/utils/fulfillment";
import { InvoiceQueueList } from "@/components/picking/InvoiceQueueList";
import { InvoicePickingDetail } from "@/components/picking/InvoicePickingDetail";

export function PickingWorkspace() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    getCurrentUserProfile(["admin", "picker"]).then((userProfile) => {
      if (active) {
        setProfile(userProfile);
      }
    });

    const unsubscribe = subscribeToFulfillmentOrders(
      (liveOrders) => {
        setOrders(liveOrders);
        setIsLoading(false);
        setSubscriptionError(null);
      },
      (err) => {
        setSubscriptionError(
          err.message || "Error al sincronizar la cola de facturas."
        );
        setIsLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const auditUser = useMemo(() => buildPickingAuditUser(profile), [profile]);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col overflow-hidden bg-background lg:flex-row">
      {subscriptionError && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive lg:hidden">
          <AlertCircle size={14} className="shrink-0" />
          <span>{subscriptionError}</span>
        </div>
      )}

      <aside
        className={`h-full w-full shrink-0 border-border/60 lg:w-[400px] lg:border-r xl:w-[440px] ${
          selectedOrder ? "hidden lg:block" : "block"
        }`}
      >
        <InvoiceQueueList
          orders={orders}
          selectedOrderId={selectedOrder?.id ?? null}
          onSelectOrder={(order) => setSelectedOrderId(order.id)}
          isLoading={isLoading}
        />
      </aside>

      <section
        aria-label="Detalle de alistamiento de factura"
        className={`h-full flex-1 flex-col overflow-y-auto bg-background ${
          selectedOrder ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedOrder ? (
          <InvoicePickingDetail
            order={selectedOrder}
            auditUser={auditUser}
            onBackToQueue={() => setSelectedOrderId(null)}
            onOrderCompleted={() => setSelectedOrderId(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/80 text-muted-foreground">
              <PackageSearch size={22} strokeWidth={1.7} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Selecciona una factura para iniciar el alistamiento
            </h2>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Elige un pedido de la cola izquierda para revisar sus productos,
              cantidades y observaciones.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
