import { Columns2, History, FileCheck2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InspectionViewMode } from "@/types/invoice-comparison";

export const INSPECTION_VIEW_TABS: readonly {
  mode: InspectionViewMode;
  label: string;
  icon: LucideIcon;
}[] = [
  { mode: "COMPARATIVO", label: "Comparativo", icon: Columns2 },
  { mode: "INICIAL", label: "Versión Inicial", icon: History },
  { mode: "ALISTADA", label: "Versión Alistada", icon: FileCheck2 },
];

