"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  calculateItemSubtotal,
  calculateOrderTotals,
  calculateQuantityAdjustment,
  mergeOrAddOrderItem,
} from "@rutea/shared";
import type { OrderItem } from "@rutea/shared";
import { subscribeProducts } from "@/services/products.service";
import { searchPosProducts } from "@/utils/facturation";
import type { Product } from "@/types/product";

export function usePosCart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(0);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const { totalBase, totalTax, total } = useMemo(
    () => calculateOrderTotals(orderItems),
    [orderItems]
  );

  const focusSearch = () => searchInputRef.current?.focus();

  const clearSearch = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    focusSearch();
  };

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
    focusSearch();
  };

  const handleCloseModal = () => {
    setSelectedProductForModal(null);
    setEditingItemIndex(null);
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

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  const resetCart = () => {
    setOrderItems([]);
    focusSearch();
  };

  return {
    loadingProducts,
    searchQuery,
    handleSearchQueryChange,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedIndex,
    setSelectedIndex,
    searchResults,
    searchInputRef,
    clearSearch,
    handleSearchKeyDown,
    handleSelectProduct,
    selectedProductForModal,
    editingItemIndex,
    handleCloseModal,
    orderItems,
    handleEditItem,
    handleConfirmItem,
    handleRemoveItem,
    handleUpdateQuantity,
    resetCart,
    totalBase,
    totalTax,
    total,
  };
}
