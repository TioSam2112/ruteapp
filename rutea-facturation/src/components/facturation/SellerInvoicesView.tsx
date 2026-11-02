"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  ReceiptText,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import {
  subscribeToSellerOrders,
  type Order,
  type PickingAuditUser,
} from "@rutea/shared";
import { getCurrentUserProfile } from "@/services/auth.service";
import { SellerInvoicesList } from "@/components/facturation/SellerInvoicesList";
import type { UserProfile } from "@/types/auth";

export function SellerInvoicesView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribeOrders: (() => void) | null = null;

    getCurrentUserProfile().then((userProfile) => {
      if (!active || !userProfile) {
        if (active) setIsLoading(false);
        return;
      }

      setProfile(userProfile);

      unsubscribeOrders = subscribeToSellerOrders(
        userProfile.uid,
        (liveOrders) => {
          if (!active) return;
          setOrders(liveOrders);
          setIsLoading(false);
          setSubscriptionError(null);
        },
        (err) => {
          if (!active) return;
          setSubscriptionError(
            err.message ||
              "No se pudieron sincronizar tus facturas en tiempo real."
          );
          setIsLoading(false);
        }
      );
    });

    return () => {
      active = false;
      unsubscribeOrders?.();
    };
  }, []);

  const sellerAudit = useMemo<PickingAuditUser | undefined>(() => {
    if (!profile) return undefined;
    return {
      uid: profile.uid,
      userName: profile.nombre
        ? `${profile.nombre} ${profile.apellido ?? ""}`.trim()
        : profile.email,
    };
  }, [profile]);

  if (!profile && isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">Cargando bandeja de facturas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-card/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <ClipboardCheck size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                Mis Facturas / Cierre y Re-liquidación
              </h1>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                {orders.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/facturation"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ReceiptText size={14} className="text-primary" />
            <span>Terminal POS</span>
          </Link>

          {profile && (
            <div className="hidden items-center gap-2 rounded-xl border border-border/30 bg-accent/40 px-3 py-1.5 text-xs sm:flex">
              <User size={13} className="text-muted-foreground" />
              <span className="max-w-[150px] truncate font-medium text-foreground">
                {profile.nombre
                  ? `${profile.nombre} ${profile.apellido ?? ""}`.trim()
                  : profile.email}
              </span>
            </div>
          )}
        </div>
      </header>

      {subscriptionError && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive sm:px-6">
          <AlertCircle size={14} className="shrink-0" />
          <span>{subscriptionError}</span>
        </div>
      )}

      <SellerInvoicesList
        orders={orders}
        isLoading={isLoading}
        sellerAudit={sellerAudit}
        selectedOrderId={selectedOrderId}
        onSelectOrder={(order) => setSelectedOrderId(order?.id ?? null)}
      />
    </div>
  );
}

