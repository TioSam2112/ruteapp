"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import type { Order, PickingAuditUser } from "@rutea/shared";
import { InvoiceComparisonHeader } from "@/components/facturation/InvoiceComparisonHeader";
import { InvoiceTotalsComparisonCard } from "@/components/facturation/InvoiceTotalsComparisonCard";
import { InvoiceClientInfoSection } from "@/components/facturation/InvoiceClientInfoSection";
import { InvoiceComparisonTable } from "@/components/facturation/InvoiceComparisonTable";
import { PosReceiptPrint } from "@/components/facturation/PosReceiptPrint";
import { useInvoiceApproval } from "@/hooks/useInvoiceApproval";
import type { InspectionViewMode } from "@/types/invoice-comparison";
import { buildOrderReliquidationComparison } from "@/utils/reliquidation";

export interface InvoiceComparisonDetailProps {
  order: Order;
  sellerAudit?: PickingAuditUser;
  onClose?: () => void;
  onOrderApproved?: (updatedOrder: Order) => void;
}

export function InvoiceComparisonDetail({
  order,
  sellerAudit,
  onClose,
  onOrderApproved,
}: InvoiceComparisonDetailProps) {
  const [viewMode, setViewMode] = useState<InspectionViewMode>("COMPARATIVO");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const comparison = useMemo(() => buildOrderReliquidationComparison(order), [order]);
  const approval = useInvoiceApproval({ order, sellerAudit, onOrderApproved });

  const ciudadLabel = order.clientData.ciudad?.trim() || "Sin población especificada";

  return (
    <div className="flex min-h-full flex-col bg-background">
      <InvoiceComparisonHeader
        order={order}
        ciudadLabel={ciudadLabel}
        onClose={onClose}
        onPrint={() => setIsPrintModalOpen(true)}
        onSendToDelivery={approval.handleSendToDelivery}
        canSendToDelivery={approval.canSendToDelivery}
        isApproving={approval.isApproving}
        isAlreadyDispatched={approval.isAlreadyDispatched}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 pb-12 sm:p-6">
        {approval.actionError && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{approval.actionError}</span>
          </div>
        )}

        <InvoiceTotalsComparisonCard comparison={comparison} />
        <InvoiceClientInfoSection order={order} comparison={comparison} ciudadLabel={ciudadLabel} />
        <InvoiceComparisonTable
          comparison={comparison}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <PosReceiptPrint
        order={order}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultVersion={viewMode === "INICIAL" ? "INICIAL" : "ALISTADA"}
      />
    </div>
  );
}
