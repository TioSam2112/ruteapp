import type { UnidadMedida } from "@/types/product";

export interface UnitMeasureOption {
  id: UnidadMedida;
  label: string;
  short: string;
}

export interface UnitBadgeConfig {
  label: string;
  short: string;
  className: string;
}

export const UNIT_MEASURE_OPTIONS: readonly UnitMeasureOption[] = [
  { id: "UNIDAD", label: "Unidad", short: "und" },
  { id: "KILO", label: "Kilo", short: "kg" },
  { id: "GRAMO", label: "Gramo", short: "g" },
  { id: "LITRO", label: "Litro", short: "L" },
  { id: "METRO", label: "Metro", short: "m" },
  { id: "CAJA", label: "Caja", short: "cj" },
] as const;

export const FRACTIONAL_UNITS: readonly UnidadMedida[] = [
  "KILO",
  "GRAMO",
  "LITRO",
  "METRO",
] as const;

export const UNIT_BADGE_CONFIG: Record<UnidadMedida, UnitBadgeConfig> = {
  UNIDAD: {
    label: "Unidad",
    short: "und",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  KILO: {
    label: "Kilo",
    short: "kg",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  GRAMO: {
    label: "Gramo",
    short: "g",
    className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  LITRO: {
    label: "Litro",
    short: "L",
    className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  METRO: {
    label: "Metro",
    short: "m",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  CAJA: {
    label: "Caja",
    short: "cj",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};
