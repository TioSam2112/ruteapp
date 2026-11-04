import { MessageSquarePlus, CornerDownRight, Loader2 } from "lucide-react";

export interface PickingItemNoteBoxProps {
  showNoteEditor: boolean;
  displayedNote: string;
  hasDraftNote: boolean;
  auditText: string | null;
  isSaving: boolean;
  onOpenNote: () => void;
  onChangeNote: (value: string) => void;
  onSaveNote: () => void;
}

export function PickingItemNoteBox({
  showNoteEditor,
  displayedNote,
  hasDraftNote,
  auditText,
  isSaving,
  onOpenNote,
  onChangeNote,
  onSaveNote,
}: PickingItemNoteBoxProps) {
  return (
    <div className="mt-3 border-t border-border/40 pt-2.5">
      {showNoteEditor ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex flex-1 items-center">
            <CornerDownRight
              size={13}
              className="pointer-events-none absolute left-3 text-muted-foreground"
            />
            <input
              type="text"
              value={displayedNote}
              onChange={(e) => onChangeNote(e.target.value)}
              onBlur={onSaveNote}
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
          {hasDraftNote && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onSaveNote}
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
          onClick={onOpenNote}
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
  );
}
