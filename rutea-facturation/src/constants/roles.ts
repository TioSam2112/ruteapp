import type { UserRole } from "@rutea/shared";

export interface RoleOption {
  value: UserRole;
  label: string;
}

export interface RoleBadgeConfig {
  label: string;
  className: string;
}

export const USER_ROLE_OPTIONS: readonly RoleOption[] = [
  { value: "delivery", label: "Repartidor (Delivery)" },
  { value: "facturation", label: "Facturación" },
  { value: "admin", label: "Administrador" },
  { value: "picker", label: "Alistador (Picker)" },
] as const;

export const ROLE_BADGE_CONFIG: Record<UserRole, RoleBadgeConfig> = {
  admin: {
    label: "Administrador",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  facturation: {
    label: "Facturación",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  delivery: {
    label: "Repartidor",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  picker: {
    label: "Alistador",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};
