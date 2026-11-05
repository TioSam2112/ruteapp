"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  calculateItemSubtotal,
  calculateOrderTotals,
  calculateQuantityAdjustment,
  mergeOrAddOrderItem,
} from "@rutea/shared";
import type { ClientOrderData, Order, OrderItem } from "@rutea/shared";
import { subscribeProducts } from "@/services/products.service";
import { searchPosProducts } from "@/utils/facturation";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";
import type { Product } from "@/types/product";
import type { Client } from "@/types/client";

function resolveOrderClient(
  order: Order,
  availableClients: Client[]
): ClientOrderData & { id: string } {
  if (
    order.id_cliente === DEFAULT_CONSUMIDOR_FINAL.id ||
    order.clientData.nombre.trim().toUpperCase() === DEFAULT_CONSUMIDOR_FINAL.nombre
  ) {
    return DEFAULT_CONSUMIDOR_FINAL;
  }

  const matched = availableClients.find((c) => c.id === order.id_cliente);
  if (matched) {
    return {
      id: matched.id,
      nombre: matched.nombreComercio
        ? `${matched.nombreComercio} (${matched.nombre})`
        : matched.nombre,
      nit: order.clientData.nit ?? "",
      telefono: matched.telefono,
      direccion: matched.direccion,
      ciudad: matched.ciudad,
    };
  }

  return {
    id: order.id_cliente || DEFAULT_CONSUMIDOR_FINAL.id,
    nombre: order.clientData.nombre || DEFAULT_CONSUMIDOR_FINAL.nombre,
    nit: order.clientData.nit ?? "",
    telefono: order.clientData.telefono ?? "",
    direccion: order.clientData.direccion ?? "",
    ciudad: order.clientData.ciudad ?? "",
  };
}

export function usePosCart() {
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

  const loadOrderForEdit = useCallback((order: Order, availableClients: Client[] = []) => {
    const resolvedClient = resolveOrderClient(order, availableClients);
    setClientData(resolvedClient);
    setOrderItems(order.items.map((item) => ({ ...item })));
    setGeneralObservation(order.generalObservation ?? "");
    setSearchQuery("");
    setIsDropdownOpen(false);
    setSelectedProductForModal(null);
    setEditingItemIndex(null);
  }, []);

  const resetCart = useCallback(() => {
    setOrderItems([]);
    setClientData(DEFAULT_CONSUMIDOR_FINAL);
    setGeneralObservation("");
    focusSearch();
  }, []);

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
    clientData,
    setClientData,
    generalObservation,
    setGeneralObservation,
    handleEditItem,
    handleConfirmItem,
    handleRemoveItem,
    handleUpdateQuantity,
    loadOrderForEdit,
    resetCart,
    totalBase,
    totalTax,
    total,
  };
}
