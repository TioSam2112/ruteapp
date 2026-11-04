import { Receipt, Trash2, Plus, Minus, CornerDownRight } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import type { OrderItem } from "@rutea/shared";

interface PosOrderItemsListProps {
  items: OrderItem[];
  onReset: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export function PosOrderItemsList({
  items,
  onReset,
  onUpdateQuantity,
  onEdit,
  onRemove,
}: PosOrderItemsListProps) {
  return (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Ítems de la Factura</h2>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-mono font-medium text-foreground">
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
          >
            <Trash2 size={13} />
            <span>Limpiar orden</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-3 shadow-inner">
            <Receipt size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Orden vacía</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
            Utiliza la barra de búsqueda superior para ingresar productos por nombre o SKU.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.id_producto}-${index}`}
              className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card/70 p-3.5 shadow-xs backdrop-blur-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-accent text-foreground">
                      {item.sku}
                    </span>
                    <span className="text-[10px] rounded px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/20 font-medium">
                      {item.unidadMedida}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground leading-snug mt-1 truncate">
                    {item.nombre}
                  </h4>

                  {item.observationItem && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/15 w-fit max-w-full">
                      <CornerDownRight size={12} className="shrink-0" />
                      <span className="truncate uppercase font-mono tracking-wide text-[11px]">
                        {item.observationItem}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold font-mono text-sm text-foreground block">
                    {formatPosCurrency(item.subtotal)}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatPosCurrency(item.precioVentaAtSale)} c/u
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-2 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-accent/40 text-foreground hover:bg-accent active:scale-95"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="min-w-10 text-center font-mono font-semibold text-xs text-foreground">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-accent/40 text-foreground hover:bg-accent active:scale-95"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    Detalles
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label="Eliminar ítem"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

