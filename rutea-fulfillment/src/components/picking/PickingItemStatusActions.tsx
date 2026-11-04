import { Check, Clock, X } from "lucide-react";
import type { ItemPickingStatus } from "@rutea/shared";

export interface PickingItemStatusActionsProps {
  itemName: string;
  currentStatus: ItemPickingStatus;
  disabled?: boolean;
  onSelectStatus: (targetStatus: ItemPickingStatus) => void;
}

export function PickingItemStatusActions({
  itemName,
  currentStatus,
  disabled = false,
  onSelectStatus,
}: PickingItemStatusActionsProps) {
  return (
    <div
      role="group"
      aria-label={`Estado de alistamiento para ${itemName}`}
      className="flex items-center gap-1.5 self-end"
    >
      <button
        type="button"
        onClick={() => onSelectStatus("ALISTADO")}
        disabled={disabled}
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
        onClick={() => onSelectStatus("PENDIENTE_LLEGADA")}
        disabled={disabled}
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
        onClick={() => onSelectStatus("AGOTADO")}
        disabled={disabled}
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
  );
}
