"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PackagePlus,
  Package,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Boxes,
  DollarSign,
  X,
} from "lucide-react";
import { subscribeProducts } from "@/services/products.service";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductModal } from "@/components/admin/products/ProductModal";
import {
  extractProductCategories,
  filterProducts,
  calculateProductMetrics,
  formatValuationCurrency,
} from "@/utils/product";
import type { Product } from "@/types/product";

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => extractProductCategories(products), [products]);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, searchTerm, selectedCategory, onlyLowStock),
    [products, searchTerm, selectedCategory, onlyLowStock]
  );

  const metrics = useMemo(() => calculateProductMetrics(products), [products]);

  const handleCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Catálogo de Productos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gestiona tu inventario, precios mayoristas y minoristas, unidades y peso.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99]"
        >
          <PackagePlus size={16} strokeWidth={2} />
          <span>Nuevo producto</span>
        </button>
      </div>

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Productos</span>
              <Boxes size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground font-mono">
              {metrics.totalCount}
            </p>
          </div>

          <div
            onClick={() => setOnlyLowStock((prev) => !prev)}
            className={`cursor-pointer rounded-2xl border p-4 shadow-2xs backdrop-blur-sm transition-all ${
              onlyLowStock
                ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
                : "border-border/50 bg-card/60 hover:bg-card/90"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Stock Crítico / Bajo</span>
              <AlertCircle
                size={16}
                className={
                  metrics.lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"
                }
              />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {metrics.lowStockCount}
              </p>
              {onlyLowStock && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  (Filtro activo)
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Valoración de Costo</span>
              <DollarSign size={16} className="text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground font-mono">
              {formatValuationCurrency(metrics.inventoryValuation)}
            </p>
          </div>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, SKU o categoría..."
              className="w-full rounded-xl border border-border bg-input pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-border bg-input px-3.5 py-2 text-xs text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border/40 bg-card/40">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Cargando catálogo de productos...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center backdrop-blur-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-4 shadow-inner">
            <Package size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            No hay productos registrados
          </h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Comienza registrando tu primer producto para habilitar la preventa,
            facturación en ruta y control de stock con pesaje o unidades.
          </p>
          <button
            onClick={handleCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99]"
          >
            <PackagePlus size={14} strokeWidth={2} />
            <span>Crear primer producto</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/20 p-8 text-center">
          <Filter size={24} className="text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold text-foreground">
            No se encontraron productos
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No hay productos que coincidan con los filtros aplicados.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("ALL");
              setOnlyLowStock(false);
            }}
            className="mt-3 text-xs text-primary font-medium hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <ProductsTable products={filteredProducts} onEdit={handleEdit} />
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productToEdit={productToEdit}
      />
    </div>
  );
}
