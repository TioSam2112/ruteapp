import { POS_RECEIPT_DIVIDER_TEXT } from "@/constants/pos-receipt";
import { formatRawNumber } from "@/utils/pos-receipt";
import type { PosPaymentType, PosReceiptVersion, PosReceiptView } from "@/utils/pos-receipt";

interface PosReceiptTicketProps {
  view: PosReceiptView;
  version: PosReceiptVersion;
  tipoPago: PosPaymentType;
}

function Divider({ className }: { className: string }) {
  return (
    <div className={`${className} select-none overflow-hidden whitespace-nowrap text-[10px] tracking-tighter`}>
      {POS_RECEIPT_DIVIDER_TEXT}
    </div>
  );
}

export function PosReceiptTicket({ view, version, tipoPago }: PosReceiptTicketProps) {
  const {
    ticket,
    fechaSalida,
    clienteUpper,
    comercioUpper,
    direccionUpper,
    ciudadUpper,
    vendedorUpper,
    totalFormatted,
  } = view;

  return (
    <div
      id="pos-80mm-printable-area"
      className="mx-auto w-full max-w-[302px] rounded-lg border border-border/70 bg-card p-4 font-mono text-[11px] leading-[1.35] text-foreground shadow-sm"
    >
      <div className="space-y-0.5">
        <p className="text-xs font-bold tracking-tight">SALIDA No. {ticket.facturaNumber}</p>
        <p>FECHA: {fechaSalida}</p>
        <p className="font-semibold">CLIENTE: {clienteUpper}</p>
        <p>NIT/CC: {ticket.cliente.nit}</p>
        <p>COMERCIO: {comercioUpper}</p>
        <p>DIRECCION: {direccionUpper}</p>
        <p>CIUDAD: {ciudadUpper}</p>
        <p>TELEFONO: {ticket.cliente.telefono}</p>
      </div>

      <Divider className="my-2" />

      <div className="grid grid-cols-12 pb-1 text-[10px] font-bold">
        <span className="col-span-2">CANT</span>
        <span className="col-span-6">DESCRIPCION</span>
        <span className="col-span-4 text-right">TOTAL</span>
      </div>

      <Divider className="mb-1.5" />

      <div className="space-y-1.5">
        {ticket.items.map((item, idx) => (
          <div key={`${item.sku}-${idx}`} className="space-y-0.5">
            <div className="grid grid-cols-12 items-start gap-1">
              <span className="col-span-3 font-semibold">{item.cantidadFormatted}</span>
              <span className="col-span-5 break-words font-semibold uppercase">
                {item.descripcion} {item.unidadMedida}
              </span>
              <span className="col-span-4 text-right font-semibold">
                {formatRawNumber(item.subtotal)}
              </span>
            </div>

            <div className="pl-2 text-[10px] text-muted-foreground print:text-foreground">
              <span>
                ({item.unidadMedida} x {formatRawNumber(item.precioUnitario)})
              </span>
              {item.observacion && (
                <span className="block uppercase">OBS: {item.observacion}</span>
              )}
              {version === "ALISTADA" && item.pickerNote && (
                <span className="block uppercase">NOTA BODEGA: {item.pickerNote}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {version === "ALISTADA" && ticket.agotados.length > 0 && (
        <>
          <Divider className="my-2" />
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

      <Divider className="my-2" />

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

      <Divider className="my-2" />

      <div className="space-y-0.5 text-[10px]">
        <p className="font-bold">FORMA DE PAGO</p>
        <div className="flex justify-between">
          <span>TIPO: {tipoPago}</span>
          <span>VALOR: {totalFormatted}</span>
        </div>
      </div>

      <Divider className="my-2" />

      <div className="space-y-1 text-[10px]">
        <div className="flex flex-wrap items-center justify-between gap-1 font-semibold">
          <span className="truncate max-w-[140px]">VEND: {vendedorUpper}</span>
          <span>PROD: {ticket.totals.prodCount}</span>
          <span>ART: {ticket.totals.artCountFormatted}</span>
        </div>

        {ticket.observacionGeneral && (
          <p className="uppercase break-words pt-0.5">OBSERVACION: {ticket.observacionGeneral}</p>
        )}
      </div>
    </div>
  );
}

