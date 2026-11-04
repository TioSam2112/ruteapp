import { History, FileCheck2, Scale } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import { formatQuantityValue } from "@/utils/reliquidation";
import type { OrderReliquidationComparison } from "@/utils/reliquidation";

interface InvoiceTotalsComparisonCardProps {
  comparison: OrderReliquidationComparison;
}

export function InvoiceTotalsComparisonCard({ comparison }: InvoiceTotalsComparisonCardProps) {
  const { diferencia } = comparison.summary;

  return (
    <section aria-label="Resumen de re-liquidación" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Versión Inicial (Preventa)
          </span>
          <History size={14} className="text-muted-foreground" />
        </div>
        <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
          {formatPosCurrency(comparison.initialVersion.total)}
        </p>
        <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>PROD: {comparison.initialVersion.prodCount}</span>
          <span>•</span>
          <span>ART: {formatQuantityValue(comparison.initialVersion.artCount)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-2xs ring-1 ring-primary/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Versión Alistada (Final Bodega)
          </span>
          <FileCheck2 size={14} className="text-primary" />
        </div>
        <p className="mt-1.5 font-mono text-xl font-bold text-primary">
          {formatPosCurrency(comparison.pickedVersion.total)}
        </p>
        <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>PROD: {comparison.pickedVersion.prodCount}</span>
          <span>•</span>
          <span>ART: {formatQuantityValue(comparison.pickedVersion.artCount)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Diferencia Re-liquidación
          </span>
          <Scale size={14} className="text-muted-foreground" />
        </div>
        <p
          className={`mt-1.5 font-mono text-xl font-bold ${
            diferencia < 0
              ? "text-amber-600"
              : diferencia > 0
                ? "text-emerald-600"
                : "text-foreground"
          }`}
        >
          {diferencia > 0 ? "+" : ""}
          {formatPosCurrency(diferencia)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {comparison.hasChanges
            ? `${comparison.modifiedItems.length} ajuste(s) peso/cant. • ${comparison.agotadosItems.length} agotado(s)`
            : "100% idéntica a la factura inicial"}
        </p>
      </div>
    </section>
  );
}

