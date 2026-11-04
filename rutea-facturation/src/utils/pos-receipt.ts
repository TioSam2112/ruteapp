import { formatPosCurrency, type Order, type OrderStatus } from "@rutea/shared";
import {
  buildOrderReliquidationComparison,
  DEFAULT_FALLBACK_CITY,
  formatQuantityValue,
  roundQuantity,
} from "@/utils/reliquidation";

const POS_80MM_CHAR_WIDTH = 42;

export interface PosTicketLineItem {
  sku: string;
  descripcion: string;
  cantidad: number;
  cantidadFormatted: string;
  unidadMedida: string;
  precioUnitario: number;
  precioUnitarioFormatted: string;
  subtotal: number;
  subtotalFormatted: string;
  observacion?: string;
  pickerNote?: string;
  pickerName?: string;
  isAgotado: boolean;
}

export interface Pos80mmTicketTotals {
  prodCount: number;
  artCount: number;
  artCountFormatted: string;
  subtotalBase: number;
  subtotalBaseFormatted: string;
  totalTax: number;
  totalTaxFormatted: string;
  totalOriginal: number;
  totalOriginalFormatted: string;
  totalAPagar: number;
  totalAPagarFormatted: string;
  diferencia: number;
  diferenciaFormatted: string;
}

export interface Pos80mmTicketData {
  widthMm: 80;
  charWidth: number;
  facturaNumber: string;
  orderId: string;
  estado: OrderStatus;
  version: "INICIAL" | "ALISTADA";
  fechaEmisionISO: string;
  fechaFormatted: string;
  horaFormatted: string;
  cliente: {
    nombre: string;
    nit: string;
    telefono: string;
    direccion: string;
    ciudad: string;
  };
  vendedorNombre: string;
  closedByName?: string;
  closedAtFormatted?: string;
  items: PosTicketLineItem[];
  agotados: PosTicketLineItem[];
  totals: Pos80mmTicketTotals;
  observacionGeneral?: string;
}

function formatDateLabels(isoString: string): {
  fechaFormatted: string;
  horaFormatted: string;
} {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return { fechaFormatted: "â€”", horaFormatted: "â€”" };
  }

  const fechaFormatted = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const horaFormatted = new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return { fechaFormatted, horaFormatted };
}

export function buildPos80mmTicketData(
  order: Order,
  version: "ALISTADA" | "INICIAL" = "ALISTADA"
): Pos80mmTicketData {
  const comparison = buildOrderReliquidationComparison(order);
  const { fechaFormatted, horaFormatted } = formatDateLabels(order.createdAt);

  const closedAtLabels = comparison.summary.closedAt
    ? formatDateLabels(comparison.summary.closedAt)
    : null;

  const allLineItems: PosTicketLineItem[] = comparison.items.map((item) => {
    const isInitial = version === "INICIAL";
    const cantidad = isInitial
      ? item.initial.cantidad
      : item.picked.cantidadAlistada;
    const subtotal = isInitial
      ? item.initial.subtotal
      : item.picked.subtotalAlistado;
    const isAgotado = !isInitial && item.changeType === "AGOTADO";

    return {
      sku: item.sku,
      descripcion: item.nombre,
      cantidad,
      cantidadFormatted: formatQuantityValue(cantidad),
      unidadMedida: item.unidadMedida,
      precioUnitario: item.precioUnitario,
      precioUnitarioFormatted: formatPosCurrency(item.precioUnitario),
      subtotal,
      subtotalFormatted: formatPosCurrency(subtotal),
      ...(item.observationItem ? { observacion: item.observationItem } : {}),
      ...(item.picked.pickerNote ? { pickerNote: item.picked.pickerNote } : {}),
      ...(item.picked.pickerName ? { pickerName: item.picked.pickerName } : {}),
      isAgotado,
    };
  });

  const activeItems =
    version === "INICIAL"
      ? allLineItems
      : allLineItems.filter((line) => !line.isAgotado && line.cantidad > 0);

  const agotados =
    version === "INICIAL"
      ? []
      : allLineItems.filter((line) => line.isAgotado || line.cantidad === 0);

  const prodCount = activeItems.length;
  const artCount = roundQuantity(
    activeItems.reduce((sum, line) => sum + line.cantidad, 0)
  );
  const subtotalBase =
    version === "INICIAL"
      ? comparison.initialVersion.subtotalBase
      : comparison.pickedVersion.subtotalBase;
  const totalTax = comparison.pickedVersion.totalTax;
  const totalOriginal = comparison.summary.totalOriginal;
  const totalAPagar =
    version === "INICIAL"
      ? comparison.initialVersion.total
      : comparison.pickedVersion.total;
  const diferencia =
    version === "INICIAL" ? 0 : comparison.summary.diferencia;

  return {
    widthMm: 80,
    charWidth: POS_80MM_CHAR_WIDTH,
    facturaNumber: order.facturaNumber,
    orderId: order.id,
    estado: order.estado,
    version,
    fechaEmisionISO: order.createdAt,
    fechaFormatted,
    horaFormatted,
    cliente: {
      nombre: order.clientData.nombre || "Consumidor Final",
      nit: order.clientData.nit?.trim() || "222222222222",
      telefono: order.clientData.telefono?.trim() || "â€”",
      direccion: order.clientData.direccion?.trim() || "â€”",
      ciudad: order.clientData.ciudad?.trim() || DEFAULT_FALLBACK_CITY,
    },
    vendedorNombre: order.vendedorNombre?.trim() || "FacturaciÃ³n POS",
    ...(comparison.summary.closedByName
      ? { closedByName: comparison.summary.closedByName }
      : {}),
    ...(closedAtLabels
      ? {
          closedAtFormatted: `${closedAtLabels.fechaFormatted} ${closedAtLabels.horaFormatted}`,
        }
      : {}),
    items: activeItems,
    agotados,
    totals: {
      prodCount,
      artCount,
      artCountFormatted: formatQuantityValue(artCount),
      subtotalBase,
      subtotalBaseFormatted: formatPosCurrency(subtotalBase),
      totalTax,
      totalTaxFormatted: formatPosCurrency(totalTax),
      totalOriginal,
      totalOriginalFormatted: formatPosCurrency(totalOriginal),
      totalAPagar,
      totalAPagarFormatted: formatPosCurrency(totalAPagar),
      diferencia,
      diferenciaFormatted: formatPosCurrency(diferencia),
    },
    ...(order.generalObservation
      ? { observacionGeneral: order.generalObservation }
      : {}),
  };
}

function padTwoColumns(left: string, right: string, width: number): string {
  const cleanLeft = left.trim();
  const cleanRight = right.trim();
  const minGap = 1;
  const maxLeftLen = Math.max(1, width - cleanRight.length - minGap);
  const truncatedLeft =
    cleanLeft.length > maxLeftLen
      ? cleanLeft.slice(0, maxLeftLen)
      : cleanLeft;
  const spaces = Math.max(
    minGap,
    width - truncatedLeft.length - cleanRight.length
  );
  return `${truncatedLeft}${" ".repeat(spaces)}${cleanRight}`;
}

function centerText(text: string, width: number): string {
  const clean = text.trim();
  if (clean.length >= width) return clean.slice(0, width);
  const leftPad = Math.floor((width - clean.length) / 2);
  return `${" ".repeat(leftPad)}${clean}`;
}

export function formatPos80mmTicketText(ticket: Pos80mmTicketData): string {
  const w = ticket.charWidth || POS_80MM_CHAR_WIDTH;
  const divider = "-".repeat(w);
  const doubleDivider = "=".repeat(w);
  const lines: string[] = [];

  lines.push(centerText("RUTEA DISTRIBUCIONES", w));
  lines.push(
    centerText(
      ticket.version === "ALISTADA"
        ? "COMPROBANTE DE DESPACHO RE-LIQUIDADO"
        : "COMPROBANTE DE PREVENTA",
      w
    )
  );
  lines.push(doubleDivider);
  lines.push(padTwoColumns(`FACTURA: ${ticket.facturaNumber}`, ticket.fechaFormatted, w));
  lines.push(padTwoColumns(`HORA: ${ticket.horaFormatted}`, `EST: ${ticket.estado}`, w));
  lines.push(padTwoColumns("VENDEDOR:", ticket.vendedorNombre, w));
  lines.push(divider);
  lines.push(`CLIENTE: ${ticket.cliente.nombre}`);
  lines.push(padTwoColumns(`NIT/CC: ${ticket.cliente.nit}`, `TEL: ${ticket.cliente.telefono}`, w));
  lines.push(`CIUDAD:  ${ticket.cliente.ciudad}`);
  lines.push(`DIR:     ${ticket.cliente.direccion}`);
  lines.push(doubleDivider);
  lines.push(padTwoColumns("CANT x PRECIO", "SUBTOTAL", w));
  lines.push(divider);

  for (const item of ticket.items) {
    lines.push(`${item.sku} - ${item.descripcion}`.slice(0, w));
    const qtyPrice = `${item.cantidadFormatted} ${item.unidadMedida} x ${item.precioUnitarioFormatted}`;
    lines.push(padTwoColumns(qtyPrice, item.subtotalFormatted, w));
    if (item.observacion) {
      lines.push(`  OBS: ${item.observacion}`.slice(0, w));
    }
    if (item.pickerNote) {
      lines.push(`  NOTA ALIST.: ${item.pickerNote}`.slice(0, w));
    }
  }

  if (ticket.agotados.length > 0) {
    lines.push(divider);
    lines.push("ITEMS AGOTADOS (NO COBRADOS):");
    for (const item of ticket.agotados) {
      lines.push(`  [AGOTADO] ${item.sku} - ${item.descripcion}`.slice(0, w));
      if (item.pickerNote) {
        lines.push(`   NOTA: ${item.pickerNote}`.slice(0, w));
      }
    }
  }

  lines.push(doubleDivider);
  lines.push(
    padTwoColumns(
      `PROD: ${ticket.totals.prodCount}`,
      `ART: ${ticket.totals.artCountFormatted}`,
      w
    )
  );
  lines.push(divider);

  if (
    ticket.version === "ALISTADA" &&
    Math.abs(ticket.totals.diferencia) > 0.009
  ) {
    lines.push(
      padTwoColumns("TOTAL INICIAL:", ticket.totals.totalOriginalFormatted, w)
    );
    lines.push(
      padTwoColumns("AJUSTE ALISTAMIENTO:", ticket.totals.diferenciaFormatted, w)
    );
  }

  lines.push(
    padTwoColumns("SUBTOTAL BASE:", ticket.totals.subtotalBaseFormatted, w)
  );
  lines.push(padTwoColumns("IVA / IMP:", ticket.totals.totalTaxFormatted, w));
  lines.push(doubleDivider);
  lines.push(
    padTwoColumns("TOTAL A PAGAR:", ticket.totals.totalAPagarFormatted, w)
  );
  lines.push(doubleDivider);

  if (ticket.observacionGeneral) {
    lines.push(`OBS: ${ticket.observacionGeneral}`);
    lines.push(divider);
  }

  return lines.join("\n");
}

export type PosReceiptVersion = "ALISTADA" | "INICIAL";
export type PosPaymentType = "EFECTIVO" | "POR DEFINIR";

export function formatPosReceiptDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "—";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatRawNumber(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export interface PosReceiptView {
  ticket: Pos80mmTicketData;
  fechaSalida: string;
  clienteUpper: string;
  comercioUpper: string;
  direccionUpper: string;
  ciudadUpper: string;
  vendedorUpper: string;
  totalFormatted: string;
}

export function buildPosReceiptView(order: Order, version: PosReceiptVersion): PosReceiptView {
  const ticket = buildPos80mmTicketData(order, version);

  return {
    ticket,
    fechaSalida: formatPosReceiptDateTime(
      version === "ALISTADA" && order.reliquidation?.closedAt
        ? order.reliquidation.closedAt
        : order.createdAt
    ),
    clienteUpper: ticket.cliente.nombre.toUpperCase(),
    comercioUpper: (
      order.clientData.nombre ||
      order.clientData.ciudad ||
      "COMERCIO GENERAL"
    ).toUpperCase(),
    direccionUpper: ticket.cliente.direccion.toUpperCase(),
    ciudadUpper: ticket.cliente.ciudad.toUpperCase(),
    vendedorUpper: ticket.vendedorNombre.toUpperCase(),
    totalFormatted: formatRawNumber(ticket.totals.totalAPagar),
  };
}
