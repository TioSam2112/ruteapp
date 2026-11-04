import { FileText, AlertTriangle, Send, Loader2 } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";

interface PosOrderSummaryCardProps {
  generalObservation: string;
  onObservationChange: (value: string) => void;
  totalBase: number;
  totalTax: number;
  total: number;
  submitError: string | null;
  isSubmitting: boolean;
  isEmpty: boolean;
  onSubmit: () => void;
}

export function PosOrderSummaryCard({
  generalObservation,
  onObservationChange,
  totalBase,
  totalTax,
  total,
  submitError,
  isSubmitting,
  isEmpty,
  onSubmit,
}: PosOrderSummaryCardProps) {
  return (
    <div className="w-full lg:w-96 flex flex-col gap-4">
      <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText size={15} className="text-primary" />
          <span>Resumen de la Orden</span>
        </h3>

        <div className="space-y-1.5">
          <label
            htmlFor="generalObservation"
            className="text-xs font-semibold text-foreground flex items-center justify-between"
          >
            <span>Observación General de Factura</span>
            <span className="text-[10px] text-muted-foreground font-normal">Opcional</span>
          </label>
          <textarea
            id="generalObservation"
            rows={2}
            value={generalObservation}
            onChange={(e) => onObservationChange(e.target.value)}
            placeholder="Ej. 1 MILLAR BOLSA, ENTREGA ANTES DE MEDIODÍA..."
            className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase font-mono"
          />
        </div>

        <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal Base:</span>
            <span className="font-mono text-foreground font-medium">
              {formatPosCurrency(totalBase)}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Impuestos / IVA (0%):</span>
            <span className="font-mono text-foreground font-medium">
              {formatPosCurrency(totalTax)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-base font-semibold text-foreground">
            <span>Total a Cobrar:</span>
            <span className="font-mono text-lg text-primary">{formatPosCurrency(total)}</span>
          </div>
        </div>

        {submitError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isEmpty}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Registrando orden...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Facturar / Enviar a Alistamiento</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

