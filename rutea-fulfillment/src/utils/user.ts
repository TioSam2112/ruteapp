import type { UserProfile } from "@rutea/shared";

export function getUserInitials(
  user: Pick<UserProfile, "email"> & { nombre?: string | null; apellido?: string | null }
): string {
  if (user.nombre && user.apellido) {
    return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

export function getUserFullName(
  user: { nombre?: string | null; apellido?: string | null }
): string {
  return `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim() || "Sin nombre";
}

export function formatRegistrationDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}
