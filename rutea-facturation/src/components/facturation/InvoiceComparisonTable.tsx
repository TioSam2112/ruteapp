import { INSPECTION_VIEW_TABS } from "@/constants/invoice-comparison";
import { InvoiceComparisonItemCard } from "@/components/facturation/InvoiceComparisonItemCard";
import type { InspectionViewMode } from "@/types/invoice-comparison";
import type { OrderReliquidationComparison } from "@/utils/reliquidation";

interface InvoiceComparisonTableProps {
  comparison: OrderReliquidationComparison;
  viewMode: InspectionViewMode;
  onViewModeChange: (mode: InspectionViewMode) => void;
}

export function InvoiceComparisonTable({
  comparison,
  viewMode,
  onViewModeChange,
}: InvoiceComparisonTableProps) {
  return (
    <section aria-label="Inspección de productos" className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Detalle de Productos ({comparison.items.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Compara lo facturado en preventa frente al peso/cantidad real despachado por bodega.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Modo de visualización de versión"
          className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-accent/60 p-1 self-start"
        >
          {INSPECTION_VIEW_TABS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              onClick={() => onViewModeChange(mode)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {comparison.items.map((item) => (
          <InvoiceComparisonItemCard
            key={`${item.id_producto}-${item.itemIndex}`}
            item={item}
            viewMode={viewMode}
          />
        ))}
      </div>
    </section>
  );
}

