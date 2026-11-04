import type { PickingAuditLog } from "@rutea/shared";

function formatAuditTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatAuditBadgeCopy(audit?: PickingAuditLog): string | null {
  if (!audit) return null;
  const user = audit.userName.trim() || "Operador";
  const time = formatAuditTime(audit.timestamp);
  return time ? `${user} • ${time}` : user;
}

