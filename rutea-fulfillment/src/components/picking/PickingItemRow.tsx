"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  X,
  MessageSquarePlus,
  CornerDownRight,
  Loader2,
} from "lucide-react";
import type {
  ItemPickingStatus,
  OrderItem,
  OrderItemPickingPatch,
} from "@rutea/shared";
import {
  formatPickingAuditTrail,
  getEffectiveItemPickedQuantity,
  getItemPickingStatus,
} from "@/utils/fulfillment";

export interface PickingItemRowProps {
  item: OrderItem;
  itemIndex: number;
  onUpdateItem: (
    itemIndex: number,
    patch: OrderItemPickingPatch
  ) => Promise<void>;
}

export function PickingItemRow({
  item,
  itemIndex,
  onUpdateItem,
}: PickingItemRowProps) {
  const currentStatus = getItemPickingStatus(item);
  const effectiveQty = getEffectiveItemPickedQuantity(item);

  const [draftQty, setDraftQty] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(
    Boolean(item.pickerNote?.trim())
  );
  const [isSaving, setIsSaving] = useState(false);

  const displayedQty = draftQty !== null ? draftQty : String(effectiveQty);
  const displayedNote = draftNote !== null ? draftNote : (item.pickerNote ?? "");
  const auditText = formatPickingAuditTrail(item.lastPickedBy);

  const runUpdate = async (patch: OrderItemPickingPatch) => {
    setIsSaving(true);
    try {
      await onUpdateItem(itemIndex, patch);
    } finally {
      setIsSaving(false);
    }
  };

  const parseDraftQuantity = (): number => {
    if (draftQty === null) return effectiveQty;
    const normalized = draftQty.replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed) || parsed < 0) {
      return effectiveQty;
    }
    return parsed;
  };

  const handleCommitQuantity = async () => {
    if (draftQty === null) return;
    const nextQty = parseDraftQuantity();
    setDraftQty(null);

    if (nextQty === effectiveQty) return;

    await runUpdate({
      cantidadAlistada: nextQty,
      action: "CANTIDAD_AJUSTADA",
    });
  };

  const handleSelectStatus = async (targetStatus: ItemPickingStatus) => {
    const currentParsedQty = parseDraftQuantity();
    setDraftQty(null);

    if (targetStatus === "AGOTADO") {
      await runUpdate({
        pickingStatus: "AGOTADO",
        cantidadAlistada: 0,
        action: "AGOTADO",
      });
      return;
    }

    const restoredQty =
      targetStatus === "ALISTADO" && currentParsedQty === 0
        ? item.cantidad
        : currentParsedQty;

    await runUpdate({
      pickingStatus: targetStatus,
      cantidadAlistada: restoredQty,
      action: targetStatus,
    });
  };

  const handleSaveNote = async () => {
    if (draftNote === null) return;
    const trimmed = draftNote.trim();
    const previous = (item.pickerNote ?? "").trim();
    setDraftNote(null);

    if (trimmed === previous) {
      if (!trimmed) setIsNoteOpen(false);
      return;
    }

    await runUpdate({
      pickerNote: trimmed,
      action: "NOTA_EDITADA",
    });

    if (!trimmed) {
      setIsNoteOpen(false);
    }
  };

  const containerToneClasses =
    currentStatus === "ALISTADO"
      ? "border-emerald-500/35 bg-emerald-500/[0.03]"
      : currentStatus === "PENDIENTE_LLEGADA"
        ? "border-amber-500/40 bg-amber-500/[0.04]"
        : currentStatus === "AGOTADO"
          ? "border-destructive/30 bg-destructive/[0.025]"
          : "border-border/70 bg-card";

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-150 sm:p-5 ${containerToneClasses}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-[15px] font-semibold leading-snug tracking-tight ${
                currentStatus === "AGOTADO"
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {item.nombre}
            </h3>
            {item.sku && (
              <span className="rounded-md bg-accent/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                {item.sku}
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            Pedido original:{" "}
            <span className="font-mono font-semibold text-foreground">
              {item.cantidad} {item.unidadMedida}
            </span>
          </p>

          {item.observationItem?.trim() && (
            <p className="pt-0.5 text-xs font-medium italic text-amber-600 dark:text-amber-400">
              “{item.observationItem.trim()}”
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`qty-${item.id_producto}-${itemIndex}`}
              className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Cant. / Peso Real
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id={`qty-${item.id_producto}-${itemIndex}`}
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={displayedQty}
                onChange={(e) => setDraftQty(e.target.value)}
                onBlur={handleCommitQuantity}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                disabled={isSaving}
                className="h-11 w-24 rounded-xl border border-border bg-input px-3 text-center font-mono text-sm font-semibold text-foreground shadow-2xs transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-60"
              />
              <span className="text-xs font-medium text-muted-foreground">
                {item.unidadMedida}
              </span>
            </div>
          </div>

          <div
            role="group"
            aria-label={`Estado de alistamiento para ${item.nombre}`}
            className="flex items-center gap-1.5 self-end"
          >
            <button
              type="button"
              onClick={() => handleSelectStatus("ALISTADO")}
              disabled={isSaving}
              aria-label="Marcar como alistado"
              aria-pressed={currentStatus === "ALISTADO"}
              title="Alistado"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all duration-150 active:scale-[0.95] disabled:opacity-60 ${
                currentStatus === "ALISTADO"
                  ? "border-emerald-600 bg-emerald-500 text-white shadow-xs"
                  : "border-border/80 bg-card text-muted-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600"
              }`}
            >
              <Check size={19} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => handleSelectStatus("PENDIENTE_LLEGADA")}
              disabled={isSaving}
              aria-label="Marcar como pendiente de llegada"
              aria-pressed={currentStatus === "PENDIENTE_LLEGADA"}
              title="Pendiente de llegada"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all duration-150 active:scale-[0.95] disabled:opacity-60 ${
                currentStatus === "PENDIENTE_LLEGADA"
                  ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                  : "border-border/80 bg-card text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600"
              }`}
            >
              <Clock size={18} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={() => handleSelectStatus("AGOTADO")}
              disabled={isSaving}
              aria-label="Marcar como agotado"
              aria-pressed={currentStatus === "AGOTADO"}
              title="Agotado (Cantidad 0)"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all duration-150 active:scale-[0.95] disabled:opacity-60 ${
                currentStatus === "AGOTADO"
                  ? "border-destructive bg-destructive text-white shadow-xs"
                  : "border-border/80 bg-card text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              }`}
            >
              <X size={19} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-border/40 pt-2.5">
        {isNoteOpen || Boolean(item.pickerNote?.trim()) ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex flex-1 items-center">
              <CornerDownRight
                size={13}
                className="pointer-events-none absolute left-3 text-muted-foreground"
              />
              <input
                type="text"
                value={displayedNote}
                onChange={(e) => setDraftNote(e.target.value)}
                onBlur={handleSaveNote}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Escribe una novedad o nota del alistador para este producto…"
                disabled={isSaving}
                className="h-9 w-full rounded-xl border border-border/80 bg-input pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            {draftNote !== null && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSaveNote}
                disabled={isSaving}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-all active:scale-[0.97]"
              >
                Guardar nota
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsNoteOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageSquarePlus size={13} />
            <span>Agregar nota del alistador</span>
          </button>
        )}

        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {auditText ?? "○ Pendiente de revisión por el alistador"}
          </span>
          {isSaving && (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary">
              <Loader2 size={11} className="animate-spin" />
              Guardando…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

