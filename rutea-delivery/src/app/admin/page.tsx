import type { Metadata } from "next";
import { DispatchDashboard } from "@/components/admin/dispatch/DispatchDashboard";

export const metadata: Metadata = {
  title: "Despacho & Rutas — Rutea Admin",
};

export const instant = false;

export default function AdminDashboardPage() {
  return <DispatchDashboard />;
}
