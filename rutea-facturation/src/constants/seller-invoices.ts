import type { SellerInvoiceFilterMode } from "@/utils/reliquidation";

export const SELLER_INVOICE_FILTER_SEGMENTS: readonly {
  mode: SellerInvoiceFilterMode;
  label: string;
}[] = [
  { mode: "TODAS", label: "Todas" },
  { mode: "EN_BODEGA", label: "En Bodega (Alistando)" },
  { mode: "LISTAS_PARA_VALIDAR", label: "Listas para Validar (Alistadas)" },
  { mode: "ENVIADAS_A_REPARTO", label: "Enviadas a Reparto" },
] as const;

