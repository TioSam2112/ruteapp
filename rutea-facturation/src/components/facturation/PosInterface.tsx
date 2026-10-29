"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Search,
  X,
  Package,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  CornerDownRight,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { subscribeProducts } from "@/services/products.service";
import { ClientSelectorFact } from "@/components/facturation/ClientSelectorFact";
import { ProductOptionsModal } from "@/components/facturation/ProductOptionsModal";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import {
  createOrder,
  calculateOrderTotals,
  calculateQuantityAdjustment,
  calculateItemSubtotal,
  mergeOrAddOrderItem,
  formatPosCurrency,
} from "@rutea/shared";
import type { OrderItem, ClientOrderData, Order } from "@rutea/shared";
import { searchPosProducts } from "@/utils/facturation";
import type { Product } from "@/types/product";
import type { UserProfile } from "@/types/auth";

interface PosInterfaceProps {
  currentUser: UserProfile;
}

export function PosInterface({ currentUser }: PosInterfaceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [clientData, setClientData] = useState<ClientOrderData & { id: string }>(
    DEFAULT_CONSUMIDOR_FINAL
  );
  const [generalObservation, setGeneralObservation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeProducts(
      (data) => {
        setProducts(data);
        setLoadingProducts(false);
      },
      () => {
        setLoadingProducts(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const searchResults = useMemo(
    () => searchPosProducts(products, searchQuery),
    [products, searchQuery]
  );

  useEffect(() => {
    setSelectedIndex(0);
    if (searchQuery.trim().length > 0 && searchResults.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchQuery, searchResults.length]);

  useEscapeKey(Boolean(completedOrder), () => handleResetOrder());

  const handleSelectProduct = (product: Product) => {
    setSelectedProductForModal(product);
    setEditingItemIndex(null);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleEditItem = (index: number) => {
    const item = orderItems[index];
    const originalProduct = products.find((p) => p.id === item.id_producto);
    if (originalProduct) {
      setSelectedProductForModal(originalProduct);
      setEditingItemIndex(index);
    }
  };

  const handleConfirmItem = (item: OrderItem) => {
    setOrderItems((prev) => mergeOrAddOrderItem(prev, item, editingItemIndex));
    setEditingItemIndex(null);
    searchInputRef.current?.focus();
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setOrderItems((prev) => {
      const next = [...prev];
      const target = next[index];
      const allowsDecimals =
        products.find((p) => p.id === target.id_producto)?.permiteDecimales ?? false;
      const newQty = calculateQuantityAdjustment(target.cantidad, delta, allowsDecimals);
      const newSubtotal = calculateItemSubtotal(newQty, target.precioVentaAtSale);

      next[index] = {
        ...target,
        cantidad: newQty,
        subtotal: newSubtotal,
      };
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        handleSelectProduct(selected);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const { totalBase, totalTax, total } = useMemo(
    () => calculateOrderTotals(orderItems),
    [orderItems]
  );

  const handleResetOrder = () => {
    setOrderItems([]);
    setGeneralObservation("");
    setClientData(DEFAULT_CONSUMIDOR_FINAL);
    setSubmitError(null);
    setCompletedOrder(null);
    searchInputRef.current?.focus();
  };

  const handleCompleteOrder = async () => {
    if (orderItems.length === 0) {
      setSubmitError("Debes agregar al menos un ítem a la orden para facturar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createOrder({
        facturaNumber: "",
        id_cliente: clientData.id,
        clientData: {
          nombre: clientData.nombre,
          nit: clientData.nit,
          telefono: clientData.telefono,
          direccion: clientData.direccion,
          ciudad: clientData.ciudad,
        },
        id_vendedor: currentUser.uid,
        vendedorNombre: currentUser.nombre
          ? `${currentUser.nombre} ${currentUser.apellido ?? ""}`.trim()
          : currentUser.email,
        items: orderItems,
        generalObservation: generalObservation.trim() || undefined,
        totalBase,
        totalTax,
        total,
        estado: "PENDIENTE_ALISTAMIENTO",
      });

      setCompletedOrder(created);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setSubmitError(
        error?.message || "Ocurrió un error al persistir la orden en Firestore."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl w-full mx-auto p-3 sm:p-6 pb-24">
      <ClientSelectorFact
        selectedClient={clientData}
        onSelectClient={setClientData}
      />

      <div className="relative z-20">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Buscar por producto, código SKU, referencia o código de barras..."
            className="w-full rounded-2xl border-2 border-border/80 bg-input pl-11 pr-10 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsDropdownOpen(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isDropdownOpen && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-border/80 bg-card shadow-2xl backdrop-blur-md overflow-hidden divide-y divide-border/30 max-h-[380px] overflow-y-auto"
          >
            {searchResults.map((product, index) => {
              const isSelected = index === selectedIndex;
              const isLowStock = product.stockActual <= (product.stockMinimo ?? 0);

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
                      <Package size={17} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded bg-accent text-foreground">
                          {product.sku}
                        </span>
                        <span className="text-[10px] rounded px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/20 font-medium">
                          {product.unidadMedida}
                        </span>
                        {product.permiteDecimales && (
                          <span className="text-[10px] text-muted-foreground font-mono inline-flex items-center gap-0.5">
                            <Scale size={9} /> Frac.
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate mt-0.5">
                        {product.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-3">
                    <span className="font-semibold font-mono text-foreground text-sm">
                      {formatPosCurrency(product.precioVenta)}
                    </span>
                    <span
                      className={`text-[10px] font-mono mt-0.5 ${
                        isLowStock ? "text-amber-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      Stock: {product.stockActual}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Ítems de la Factura
              </h2>
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                {orderItems.length}
              </span>
            </div>

            {orderItems.length > 0 && (
              <button
                type="button"
                onClick={handleResetOrder}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Limpiar orden</span>
              </button>
            )}
          </div>

          {orderItems.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-3 shadow-inner">
                <Receipt size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Orden vacía
              </h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                Utiliza la barra de búsqueda superior para ingresar productos por nombre o SKU.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {orderItems.map((item, index) => {
                return (
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
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-accent/40 text-foreground hover:bg-accent active:scale-95"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-10 text-center font-mono font-semibold text-xs text-foreground">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-accent/40 text-foreground hover:bg-accent active:scale-95"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditItem(index)}
                          className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          Detalles
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          aria-label="Eliminar ítem"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
                <span className="text-[10px] text-muted-foreground font-normal">
                  Opcional
                </span>
              </label>
              <textarea
                id="generalObservation"
                rows={2}
                value={generalObservation}
                onChange={(e) => setGeneralObservation(e.target.value)}
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
                <span className="font-mono text-lg text-primary">
                  {formatPosCurrency(total)}
                </span>
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
              onClick={handleCompleteOrder}
              disabled={isSubmitting || orderItems.length === 0}
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
      </div>

      <ProductOptionsModal
        isOpen={Boolean(selectedProductForModal)}
        product={selectedProductForModal}
        initialItem={editingItemIndex !== null ? orderItems[editingItemIndex] : null}
        onClose={() => {
          setSelectedProductForModal(null);
          setEditingItemIndex(null);
        }}
        onConfirm={handleConfirmItem}
      />

      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={handleResetOrder}
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
              <h3 className="text-lg font-semibold text-foreground">
                ¡Orden Registrada con Éxito!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Comprobante: <strong className="font-mono text-foreground">{completedOrder.facturaNumber}</strong>
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-accent/30 p-3.5 border border-border/40 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-foreground truncate max-w-[200px]">
                  {completedOrder.clientData.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {completedOrder.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ítems:</span>
                <span className="font-mono text-foreground">
                  {completedOrder.items.length} productos
                </span>
              </div>
              {completedOrder.generalObservation && (
                <div className="pt-1 border-t border-border/30">
                  <span className="text-muted-foreground block text-[10px]">Nota General:</span>
                  <span className="font-mono text-foreground text-[11px] uppercase">
                    {completedOrder.generalObservation}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/30 pt-2 font-semibold">
                <span className="text-foreground">Total Facturado:</span>
                <span className="font-mono text-primary text-sm">
                  {formatPosCurrency(completedOrder.total)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetOrder}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover active:scale-[0.99]"
              >
                <RefreshCw size={14} />
                <span>Iniciar Nueva Factura</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
