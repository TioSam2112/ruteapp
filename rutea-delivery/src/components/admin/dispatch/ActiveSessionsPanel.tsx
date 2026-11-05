"use client";

import { Calendar, MapPin, Truck, Users } from "lucide-react";
import { formatPosCurrency, type DeliverySession } from "@rutea/shared";
import { SESSION_STATUS_META } from "@/constants/dispatch";
import { formatDispatchTimestamp } from "@/utils/dispatch";

interface ActiveSessionsPanelProps {
  sessions: readonly DeliverySession[];
}

export function ActiveSessionsPanel({ sessions }: ActiveSessionsPanelProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Truck size={22} />
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">
          No hay rutas activas en este momento
        </h3>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Selecciona una o varias poblaciones en la pestaña de facturas listas
          para armar y despachar una nueva sesión de reparto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {sessions.map((session) => {
        const statusMeta = SESSION_STATUS_META[session.estado];
        return (
          <div
            key={session.id}
            className="flex flex-col justify-between gap-4 rounded-3xl border border-border/50 bg-card p-5 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {session.sessionCode}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold tracking-tight text-foreground">
                    {session.nombreRuta}
                  </h3>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Monto Esperado
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {formatPosCurrency(session.totalMontoEsperado)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {session.poblaciones.map((ciudad) => (
                  <span
                    key={ciudad}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    <MapPin size={11} className="text-primary" />
                    {ciudad}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl border border-border/40 bg-muted/30 p-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users size={12} />
                  Cuadrilla Asignada ({session.assignedCrew.length})
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {session.assignedCrew.map((member) => (
                    <span
                      key={member.uid}
                      className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {member.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">
                  {session.totalFacturas}
                </strong>{" "}
                {session.totalFacturas === 1
                  ? "factura vinculada"
                  : "facturas vinculadas"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {formatDispatchTimestamp(session.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

