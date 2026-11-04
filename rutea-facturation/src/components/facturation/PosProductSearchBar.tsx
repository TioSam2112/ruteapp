import type { KeyboardEvent, RefObject } from "react";
import { Search, X, Package, Scale } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import type { Product } from "@/types/product";

interface PosProductSearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  isDropdownOpen: boolean;
  results: Product[];
  selectedIndex: number;
  onHoverIndex: (index: number) => void;
  onSelectProduct: (product: Product) => void;
}

export function PosProductSearchBar({
  inputRef,
  searchQuery,
  onSearchQueryChange,
  onClear,
  onKeyDown,
  onFocus,
  isDropdownOpen,
  results,
  selectedIndex,
  onHoverIndex,
  onSelectProduct,
}: PosProductSearchBarProps) {
  return (
    <div className="relative z-20">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder="Buscar por producto, código SKU, referencia o código de barras..."
          className="w-full rounded-2xl border-2 border-border/80 bg-input pl-11 pr-10 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isDropdownOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-border/80 bg-card shadow-2xl backdrop-blur-md overflow-hidden divide-y divide-border/30 max-h-[380px] overflow-y-auto">
          {results.map((product, index) => {
            const isSelected = index === selectedIndex;
            const isLowStock = product.stockActual <= (product.stockMinimo ?? 0);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                onMouseEnter={() => onHoverIndex(index)}
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
  );
}

