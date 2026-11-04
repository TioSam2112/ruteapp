"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Minus, Scale, FileText, Check } from "lucide-react";
import { useEscapeKey } from "@rutea/shared";
import {
  calculateItemSubtotal,
  calculateQuantityAdjustment,
  formatPosCurrency,
} from "@rutea/shared";
import type { OrderItem } from "@rutea/shared";
import type { Product } from "@/types/product";

interface ProductOptionsModalProps {
  isOpen: boolean;
  product: Product | null;
  initialItem?: OrderItem | null;
  onClose: () => void;
  onConfirm: (item: OrderItem) => void;
}

export function ProductOptionsModal({
  isOpen,
  product,
  initialItem,
  onClose,
  onConfirm,
}: ProductOptionsModalProps) {
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(0);
  const [observacion, setObservacion] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const syncKey = `${isOpen}-${product?.id ?? ""}-${initialItem?.id_producto ?? ""}-${initialItem?.cantidad ?? ""}-${initialItem?.precioVentaAtSale ?? ""}-${initialItem?.observationItem ?? ""}`;
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);

  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (product) {
      if (initialItem) {
        setCantidad(initialItem.cantidad);
        setPrecio(initialItem.precioVentaAtSale);
        setObservacion(initialItem.observationItem ?? "");
      } else {
        setCantidad(1);
        setPrecio(product.precioVenta);
        setObservacion("");
      }
      setError(null);
    }
  }

  const cantidadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cantidadInputRef.current?.focus();
        cantidadInputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEscapeKey(isOpen, onClose);

  if (!isOpen || !product || typeof document === "undefined") return null;

  const allowsDecimals = product.permiteDecimales;

  const handleCantidadChange = (valStr: string) => {
    setError(null);
    if (valStr === "") {
      setCantidad(0);
      return;
    }
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      setCantidad(val);
    }
  };

  const adjustCantidad = (delta: number) => {
    setError(null);
    setCantidad(calculateQuantityAdjustment(cantidad, delta, allowsDecimals));
  };

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    if (!allowsDecimals && !Number.isInteger(cantidad)) {
      setError("Este producto no admite cantidades fraccionadas/decimales.");
      return;
    }

    if (precio < 0) {
      setError("El precio no puede ser negativo.");
      return;
    }

    const subtotal = calculateItemSubtotal(cantidad, precio);

    const item: OrderItem = {
      id_producto: product.id,
      sku: product.sku,
      nombre: product.nombre,
      precioVentaAtSale: precio,
      cantidad,
      unidadMedida: product.unidadMedida,
      observationItem: observacion.trim() || undefined,
      subtotal,
    };

    onConfirm(item);
    onClose();
  };

  const subtotalLive = calculateItemSubtotal(cantidad, precio);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between pb-4 border-b border-border/40 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-accent text-foreground">
                {product.sku}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                {product.unidadMedida}
              </span>
              {allowsDecimals && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Scale size={11} />
                  Fraccionable
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-snug">
              {product.nombre}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stock en bodega: <strong className="font-mono">{product.stockActual}</strong> {product.unidadMedida.toLowerCase()}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cantidad" className="text-xs font-semibold text-foreground">
                Cantidad a facturar
              </label>
              <span className="text-[11px] text-muted-foreground">
                {allowsDecimals ? "Acepta decimales (ej. 1.25)" : "Solo números enteros"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustCantidad(-1)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/40 text-foreground transition-all hover:bg-accent active:scale-95"
              >
                <Minus size={16} />
              </button>

              <input
                ref={cantidadInputRef}
                id="cantidad"
                type="number"
                step={allowsDecimals ? "any" : "1"}
                min={allowsDecimals ? "0.01" : "1"}
                value={cantidad === 0 ? "" : cantidad}
                onChange={(e) => handleCantidadChange(e.target.value)}
                placeholder="0"
                className="w-full text-center rounded-xl border border-border bg-input py-2.5 text-lg font-semibold font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => adjustCantidad(1)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/40 text-foreground transition-all hover:bg-accent active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="precio" className="text-xs font-semibold text-foreground">
                Precio Unitario ($)
              </label>
              <span className="text-[11px] text-muted-foreground">
                PVP base: {formatPosCurrency(product.precioVenta)}
              </span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold text-xs">
                $
              </span>
              <input
                id="precio"
                type="number"
                step="any"
                min="0"
                value={precio === 0 ? "" : precio}
                onChange={(e) => setPrecio(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="w-full rounded-xl border border-border bg-input pl-8 pr-3.5 py-2.5 text-sm font-mono text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="observacion" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText size={13} className="text-primary" />
                <span>Observación del ítem / Detalle de entrega</span>
              </label>
              <span className="text-[11px] text-muted-foreground">Opcional</span>
            </div>
            <input
              id="observacion"
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. 4 BULTOS, EMPACAR AL VACÍO, MADURO..."
              className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase"
            />
            <p className="text-[11px] text-muted-foreground">
              Esta nota se imprimirá directamente debajo del producto en el comprobante.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-accent/30 p-3 border border-border/40">
            <span className="text-xs font-medium text-muted-foreground">
              Subtotal del ítem:
            </span>
            <span className="text-base font-semibold font-mono text-foreground">
              {formatPosCurrency(subtotalLive)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border/80 px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99]"
            >
              <Check size={15} strokeWidth={2.5} />
              <span>{initialItem ? "Actualizar ítem" : "Añadir a la orden"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
