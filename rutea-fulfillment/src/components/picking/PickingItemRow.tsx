"use client";

import type { OrderItem, OrderItemPickingPatch } from "@rutea/shared";
import { usePickingItemActions } from "@/hooks/useOrderPickingActions";
import { PickingItemStatusActions } from "@/components/picking/PickingItemStatusActions";
import { PickingItemNoteBox } from "@/components/picking/PickingItemNoteBox";

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
  const {
    currentStatus,
    displayedQty,
    displayedNote,
    auditText,
    showNoteEditor,
    hasDraftNote,
    isSaving,
    setDraftQty,
    setDraftNote,
    openNoteEditor,
    handleCommitQuantity,
    handleSelectStatus,
    handleSaveNote,
  } = usePickingItemActions({
    item,
    itemIndex,
    onUpdateItem,
  });

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

          <PickingItemStatusActions
            itemName={item.nombre}
            currentStatus={currentStatus}
            disabled={isSaving}
            onSelectStatus={handleSelectStatus}
          />
        </div>
      </div>

      <PickingItemNoteBox
        showNoteEditor={showNoteEditor}
        displayedNote={displayedNote}
        hasDraftNote={hasDraftNote}
        auditText={auditText}
        isSaving={isSaving}
        onOpenNote={openNoteEditor}
        onChangeNote={setDraftNote}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
}
