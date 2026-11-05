"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ReceiptText,
  LayoutDashboard,
  User,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { getCurrentUserProfile, getOrderById } from "@rutea/shared";
import { PosInterface } from "@/components/facturation/PosInterface";
import type { Order, UserProfile } from "@rutea/shared";
import type { Client } from "@/types/client";

export function FacturationPosView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editOrderId = searchParams.get("editOrderId");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [fetchedEditState, setFetchedEditState] = useState<{
    requestedId: string;
    order: Order | null;
  } | null>(null);

  useEffect(() => {
    getCurrentUserProfile().then((p) => {
      if (!p || (p.rol !== "facturation" && p.rol !== "admin")) {
        router.replace("/");
        return;
      }
      setProfile(p);
      setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (!editOrderId) return;
    let active = true;

    getOrderById(editOrderId)
      .then((order) => {
        if (!active) return;
        const canEdit =
          order &&
          (order.estado === "PENDIENTE_ALISTAMIENTO" ||
            order.estado === "EN_ALISTAMIENTO" ||
            order.estado === "ALISTADO");
        setFetchedEditState({
          requestedId: editOrderId,
          order: canEdit ? order : null,
        });
      })
      .catch(() => {
        if (!active) return;
        setFetchedEditState({
          requestedId: editOrderId,
          order: null,
        });
      });

    return () => {
      active = false;
    };
  }, [editOrderId]);

  const loadingOrder =
    Boolean(editOrderId) && fetchedEditState?.requestedId !== editOrderId;
  const editingOrder =
    editOrderId && fetchedEditState?.requestedId === editOrderId
      ? fetchedEditState.order
      : null;

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev.filter((c) => c.id !== newClient.id)]);
  };

  const handleCancelEdit = () => {
    setFetchedEditState(null);
    if (editOrderId) {
      router.replace("/facturation");
    }
  };

  const handleBackToInvoices = () => {
    setFetchedEditState(null);
    router.push("/facturation/invoices");
  };

  if (checking || loadingOrder) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">
            {loadingOrder ? "Cargando factura para edición..." : "Cargando terminal POS..."}
          </span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-card/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <ReceiptText size={17} strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Rutea POS
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              {editingOrder ? `Editando #${editingOrder.facturaNumber}` : "Preventa Activa"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/facturation/invoices"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ClipboardCheck size={14} className="text-primary" />
            <span>Mis Facturas / Cierre</span>
          </Link>

          <div className="hidden items-center gap-2 rounded-xl border border-border/30 bg-accent/40 px-3 py-1.5 text-xs sm:flex">
            <User size={13} className="text-muted-foreground" />
            <span className="max-w-[150px] truncate font-medium text-foreground">
              {profile.nombre
                ? `${profile.nombre} ${profile.apellido ?? ""}`.trim()
                : profile.email}
            </span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              ({profile.rol})
            </span>
          </div>

          {profile.rol === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1">
        <PosInterface
          currentUser={profile}
          clients={clients}
          onClientCreated={handleClientCreated}
          onClientsLoaded={setClients}
          editingOrder={editingOrder}
          onCancelEdit={handleCancelEdit}
          onBackToInvoices={handleBackToInvoices}
        />
      </div>
    </div>
  );
}
