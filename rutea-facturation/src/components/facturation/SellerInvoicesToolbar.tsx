import { Search, X } from "lucide-react";
import { SELLER_INVOICE_FILTER_SEGMENTS } from "@/constants/seller-invoices";
import type { SellerInvoiceFilterMode } from "@/utils/reliquidation";

interface SellerInvoicesToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterMode: SellerInvoiceFilterMode;
  onFilterModeChange: (mode: SellerInvoiceFilterMode) => void;
  counts: Record<SellerInvoiceFilterMode, number>;
}

export function SellerInvoicesToolbar({
  searchTerm,
  onSearchTermChange,
  filterMode,
  onFilterModeChange,
  counts,
}: SellerInvoicesToolbarProps) {
  return (
    <div className="border-b border-border/40 bg-card/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar por #Factura, cliente, NIT o población..."
            className="w-full rounded-xl border border-border/80 bg-input py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 sm:text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filtrar facturas por estado"
          className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/50 bg-accent/60 p-1"
        >
          {SELLER_INVOICE_FILTER_SEGMENTS.map(({ mode, label }) => {
            const isActive = filterMode === mode;

            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterModeChange(mode)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="whitespace-nowrap">{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-semibold ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-background/70 text-muted-foreground"
                  }`}
                >
                  {counts[mode]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

