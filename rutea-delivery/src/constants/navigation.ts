import {
  LayoutDashboard,
  Users,
  MapPin,
  Package,
  Building2,
  Truck,
  Settings,
} from "lucide-react";
import type { ElementType } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: readonly NavGroup[] = [
  {
    title: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Usuarios & Roles", href: "/admin/users", icon: Users },
    ],
  },
  {
    title: "Gestión de Preventa",
    items: [
      { label: "Clientes", href: "/admin/clients", icon: Building2 },
      { label: "Rutas & Poblaciones", href: "/admin/dispatch", icon: MapPin },
      { label: "Catálogo de Productos", href: "/admin/products", icon: Package },
    ],
  },
  {
    title: "Reparto & Operación",
    items: [
      { label: "Reparto & Entregas", href: "/delivery", icon: Truck },
    ],
  },
  {
    title: "Configuración",
    items: [
      { label: "Configuración", href: "/admin/settings", icon: Settings },
    ],
  },
] as const;

