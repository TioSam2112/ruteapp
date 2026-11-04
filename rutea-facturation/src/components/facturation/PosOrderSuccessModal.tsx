import { CheckCircle2, RefreshCw } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import type { Order } from "@rutea/shared";

interface PosOrderSuccessModalProps {
  order: Order;
  onReset: () => void;
}

export function PosOrderSuccessModal({ order, onReset }: PosOrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
        onClick={onReset}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl transition-all"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3 shadow-inner">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">¡Orden Registrada con Éxito!</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Comprobante: <strong className="font-mono text-foreground">{order.facturaNumber}</strong>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-accent/30 p-3.5 border border-border/40 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {order.clientData.nombre}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {order.estado}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ítems:</span>
            <span className="font-mono text-foreground">{order.items.length} productos</span>
          </div>
          {order.generalObservation && (
            <div className="pt-1 border-t border-border/30">
              <span className="text-muted-foreground block text-[10px]">Nota General:</span>
              <span className="font-mono text-foreground text-[11px] uppercase">
                {order.generalObservation}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border/30 pt-2 font-semibold">
            <span className="text-foreground">Total Facturado:</span>
            <span className="font-mono text-primary text-sm">{formatPosCurrency(order.total)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover active:scale-[0.99]"
          >
            <RefreshCw size={14} />
            <span>Iniciar Nueva Factura</span>
          </button>
        </div>
      </div>
    </div>
  );
}

