import type { Metadata } from "next";
import { UsersView } from "@rutea/shared";

export const metadata: Metadata = {
  title: "Usuarios & Roles — Rutea Admin",
};

export const instant = false;

export default function UsersPage() {
  return <UsersView />;
}
