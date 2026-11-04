"use client";

import { useState } from "react";
import { Printer, X, FileCheck2, History } from "lucide-react";
import type { Order } from "@rutea/shared";
import { useEscapeKey } from "@rutea/shared";
import { POS_80MM_PRINT_STYLES } from "@/constants/pos-receipt";
import { PosReceiptTicket } from "@/components/facturation/PosReceiptTicket";
import { buildPosReceiptView } from "@/utils/pos-receipt";
import type { PosPaymentType, PosReceiptVersion } from "@/utils/pos-receipt";

export interface PosReceiptPrintProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  defaultVersion?: PosReceiptVersion;
}

export function PosReceiptPrint({
  order,
  isOpen,
  onClose,
  defaultVersion = "ALISTADA",
}: PosReceiptPrintProps) {
  const [version, setVersion] = useState<PosReceiptVersion>(defaultVersion);
  const [tipoPago, setTipoPago] = useState<PosPaymentType>("EFECTIVO");

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const view = buildPosReceiptView(order, version);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:static print:inset-auto print:block print:p-0">
      <style>{POS_80MM_PRINT_STYLES}</style>

      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa de impresión POS Factura ${order.facturaNumber}`}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:border-none print:bg-transparent print:shadow-none"
      >
        <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-3.5 sm:px-5 print:hidden">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Tirilla Térmica POS (80mm)</h3>
            <p className="text-xs text-muted-foreground">
              Factura #{order.facturaNumber} • Selecciona la versión a imprimir
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista previa"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-border/40 bg-accent/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 print:hidden">
          <div
            role="tablist"
            aria-label="Versión del ticket"
            className="grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-background p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={version === "ALISTADA"}
              onClick={() => setVersion("ALISTADA")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                version === "ALISTADA"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck2 size={13} />
              <span>Versión Alistada</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={version === "INICIAL"}
              onClick={() => setVersion("INICIAL")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                version === "INICIAL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History size={13} />
              <span>Versión Inicial</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Pago:</span>
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value as PosPaymentType)}
              className="rounded-lg border border-border bg-input px-2.5 py-1 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="POR DEFINIR">POR DEFINIR</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-accent/50 p-4 sm:p-6 print:overflow-visible print:bg-transparent print:p-0">
          <PosReceiptTicket view={view} version={version} tipoPago={tipoPago} />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-border/50 bg-card px-4 py-3.5 sm:px-5 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <Printer size={15} />
            <span>Imprimir {version === "ALISTADA" ? "Versión Alistada" : "Versión Inicial"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
