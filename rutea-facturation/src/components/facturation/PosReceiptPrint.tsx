"use client";

import { useState } from "react";
import { Printer, X, FileCheck2, History } from "lucide-react";
import type { Order } from "@rutea/shared";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { buildPos80mmTicketData } from "@/utils/reliquidation";

export interface PosReceiptPrintProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  defaultVersion?: "ALISTADA" | "INICIAL";
}

function formatPosReceiptDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "—";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function formatRawNumber(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function PosReceiptPrint({
  order,
  isOpen,
  onClose,
  defaultVersion = "ALISTADA",
}: PosReceiptPrintProps) {
  const [version, setVersion] = useState<"ALISTADA" | "INICIAL">(
    defaultVersion
  );
  const [tipoPago, setTipoPago] = useState<"EFECTIVO" | "POR DEFINIR">(
    "EFECTIVO"
  );

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const ticket = buildPos80mmTicketData(order, version);
  const fechaSalida = formatPosReceiptDateTime(
    version === "ALISTADA" && order.reliquidation?.closedAt
      ? order.reliquidation.closedAt
      : order.createdAt
  );
  const clienteUpper = ticket.cliente.nombre.toUpperCase();
  const comercioUpper = (
    order.clientData.nombre ||
    order.clientData.ciudad ||
    "COMERCIO GENERAL"
  ).toUpperCase();
  const direccionUpper = ticket.cliente.direccion.toUpperCase();
  const ciudadUpper = ticket.cliente.ciudad.toUpperCase();
  const vendedorUpper = ticket.vendedorNombre.toUpperCase();
  const totalFormatted = formatRawNumber(ticket.totals.totalAPagar);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 print:static print:inset-auto print:block print:p-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pos-80mm-printable-area,
          #pos-80mm-printable-area * {
            visibility: visible !important;
          }
          #pos-80mm-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 2mm 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

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
            <h3 className="text-sm font-semibold text-foreground">
              Tirilla Térmica POS (80mm)
            </h3>
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
              onChange={(e) =>
                setTipoPago(e.target.value as "EFECTIVO" | "POR DEFINIR")
              }
              className="rounded-lg border border-border bg-input px-2.5 py-1 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="POR DEFINIR">POR DEFINIR</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-accent/50 p-4 sm:p-6 print:overflow-visible print:bg-transparent print:p-0">
          <div
            id="pos-80mm-printable-area"
            className="mx-auto w-full max-w-[302px] rounded-lg border border-border/70 bg-card p-4 font-mono text-[11px] leading-[1.35] text-foreground shadow-sm"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold tracking-tight">
                SALIDA No. {ticket.facturaNumber}
              </p>
              <p>FECHA: {fechaSalida}</p>
              <p className="font-semibold">CLIENTE: {clienteUpper}</p>
              <p>NIT/CC: {ticket.cliente.nit}</p>
              <p>COMERCIO: {comercioUpper}</p>
              <p>DIRECCION: {direccionUpper}</p>
              <p>CIUDAD: {ciudadUpper}</p>
              <p>TELEFONO: {ticket.cliente.telefono}</p>
            </div>

            <div className="my-2 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
              ----------------------------------------
            </div>

            <div className="grid grid-cols-12 pb-1 text-[10px] font-bold">
              <span className="col-span-2">CANT</span>
              <span className="col-span-6">DESCRIPCION</span>
              <span className="col-span-4 text-right">TOTAL</span>
            </div>

            <div className="mb-1.5 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
              ----------------------------------------
            </div>

            <div className="space-y-1.5">
              {ticket.items.map((item, idx) => (
                <div key={`${item.sku}-${idx}`} className="space-y-0.5">
                  <div className="grid grid-cols-12 items-start gap-1">
                    <span className="col-span-3 font-semibold">
                      {item.cantidadFormatted}
                    </span>
                    <span className="col-span-5 break-words font-semibold uppercase">
                      {item.descripcion} {item.unidadMedida}
                    </span>
                    <span className="col-span-4 text-right font-semibold">
                      {formatRawNumber(item.subtotal)}
                    </span>
                  </div>

                  <div className="pl-2 text-[10px] text-muted-foreground print:text-foreground">
                    <span>
                      ({item.unidadMedida} x{" "}
                      {formatRawNumber(item.precioUnitario)})
                    </span>
                    {item.observacion && (
                      <span className="block uppercase">
                        OBS: {item.observacion}
                      </span>
                    )}
                    {version === "ALISTADA" && item.pickerNote && (
                      <span className="block uppercase">
                        NOTA BODEGA: {item.pickerNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {version === "ALISTADA" && ticket.agotados.length > 0 && (
              <>
                <div className="my-2 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
                  ----------------------------------------
                </div>
                <div className="space-y-0.5 text-[10px]">
                  <p className="font-bold">AGOTADOS EN BODEGA (0 COBRADO):</p>
                  {ticket.agotados.map((agotado, idx) => (
                    <p key={`agotado-${agotado.sku}-${idx}`} className="uppercase">
                      0 {agotado.descripcion} ({agotado.unidadMedida})
                    </p>
                  ))}
                </div>
              </>
            )}

            <div className="my-2 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
              ----------------------------------------
            </div>

            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between font-bold text-xs">
                <span>TOTAL</span>
                <span>{totalFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>CANCELADO</span>
                <span>{totalFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>CAMBIO</span>
                <span>0</span>
              </div>
            </div>

            <div className="my-2 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
              ----------------------------------------
            </div>

            <div className="space-y-0.5 text-[10px]">
              <p className="font-bold">FORMA DE PAGO</p>
              <div className="flex justify-between">
                <span>TIPO: {tipoPago}</span>
                <span>VALOR: {totalFormatted}</span>
              </div>
            </div>

            <div className="my-2 select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter">
              ----------------------------------------
            </div>

            <div className="space-y-1 text-[10px]">
              <div className="flex flex-wrap items-center justify-between gap-1 font-semibold">
                <span className="truncate max-w-[140px]">
                  VEND: {vendedorUpper}
                </span>
                <span>PROD: {ticket.totals.prodCount}</span>
                <span>ART: {ticket.totals.artCountFormatted}</span>
              </div>

              {ticket.observacionGeneral && (
                <p className="uppercase break-words pt-0.5">
                  OBSERVACION: {ticket.observacionGeneral}
                </p>
              )}
            </div>
          </div>
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
            <span>
              Imprimir{" "}
              {version === "ALISTADA"
                ? "Versión Alistada"
                : "Versión Inicial"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

