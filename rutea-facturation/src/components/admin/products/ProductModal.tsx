"use client";

import { createPortal } from "react-dom";
import { X, PackagePlus, Edit3 } from "lucide-react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useEscapeKey } from "@rutea/shared";
import type { Product } from "@/types/product";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess?: () => void;
}

export function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: ProductModalProps) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

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
        className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {productToEdit ? (
                <Edit3 size={18} strokeWidth={2} />
              ) : (
                <PackagePlus size={18} strokeWidth={2} />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {productToEdit ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {productToEdit
                  ? "Modifica los precios, categorías, unidades o stock del producto."
                  : "Ingresa los detalles para registrar un nuevo producto en el catálogo."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          <ProductForm
            productToEdit={productToEdit}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
