import { MapPin } from "lucide-react";
import type { Order } from "@rutea/shared";
import { SellerInvoiceCard } from "@/components/facturation/SellerInvoiceCard";
import type { groupSellerOrdersByCity } from "@/utils/reliquidation";

type SellerCityGroup = ReturnType<typeof groupSellerOrdersByCity>[number];

interface SellerInvoicesCityGroupProps {
  group: SellerCityGroup;
  hasSelection: boolean;
  activeSelectedId: string | null;
  onSelect: (order: Order) => void;
}

export function SellerInvoicesCityGroup({
  group,
  hasSelection,
  activeSelectedId,
  onSelect,
}: SellerInvoicesCityGroupProps) {
  return (
    <section aria-label={`Población ${group.ciudad}`} className="space-y-2.5">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-border/50 bg-sidebar/95 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={14} className="shrink-0 text-primary" />
          <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-foreground">
            {group.ciudad}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {group.readyToReliquidateCount > 0 && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700">
              {group.readyToReliquidateCount} por validar
            </span>
          )}
          <span className="rounded-full bg-card px-2 py-0.5 font-mono text-xs font-semibold text-foreground border border-border/50">
            {group.totalOrders} {group.totalOrders === 1 ? "factura" : "facturas"}
          </span>
        </div>
      </div>

      <div
        className={`grid gap-2.5 ${
          hasSelection ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        {group.orders.map((order) => (
          <SellerInvoiceCard
            key={order.id}
            order={order}
            isSelected={order.id === activeSelectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

