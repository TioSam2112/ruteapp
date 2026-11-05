"use client";

import { CheckCircle2, Clock, MapPin, Navigation, Truck, Users, Wallet } from "lucide-react";
import { formatPosCurrency, type DeliverySession } from "@rutea/shared";
import type { DeliveryCrewDisplayMember, DeliveryRouteProgress } from "@/types/delivery";

export interface DeliverySessionHeaderProps {
  session: DeliverySession | null;
  crewMembers: readonly DeliveryCrewDisplayMember[];
  companionsSummary: string;
  progress: DeliveryRouteProgress;
}

export function DeliverySessionHeader({
  session,
  crewMembers,
  companionsSummary,
  progress,
}: DeliverySessionHeaderProps) {
  if (!session) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border border-border/50 bg-card/85 px-6 py-14 text-center shadow-xs backdrop-blur-md sm:px-10 sm:py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <Truck size={30} strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          No tienes rutas de entrega asignadas en este momento
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          En cuanto el administrador de despacho asigne una ruta a tu cuadrilla,
          verás aquí las poblaciones, tus compañeros de reparto y la cola de
          facturas en tiempo real.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Esperando asignación en tiempo real
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border/50 bg-card/90 shadow-xs backdrop-blur-md">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                <Navigation size={12} />
                {session.sessionCode}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                EN_CURSO
              </span>
              <span className="text-xs text-muted-foreground">
                Fecha: {session.fecha}
              </span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {session.nombreRuta}
            </h1>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {session.poblaciones.map((ciudad) => (
                <span
                  key={ciudad}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  <MapPin size={11} className="text-primary" />
                  {ciudad}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:text-right">
            <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Recaudado / Esperado
              </p>
              <p className="mt-0.5 text-base font-bold tracking-tight text-foreground sm:text-lg">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatPosCurrency(progress.montoRecaudado)}
                </span>{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / {formatPosCurrency(progress.totalMontoEsperado)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4 lg:col-span-7">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Users size={14} className="text-primary" />
                <span>Cuadrilla de Reparto ({crewMembers.length})</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Sesión compartida
              </span>
            </div>

            <p className="text-xs font-medium text-foreground">
              <span className="text-muted-foreground">Compañeros: </span>
              {companionsSummary}
            </p>

            <div className="flex flex-wrap gap-2">
              {crewMembers.map((member) => (
                <div
                  key={member.uid}
                  className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-medium ${
                    member.isCurrentUser
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background text-foreground"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {member.initials}
                  </span>
                  <span>{member.nombre}</span>
                  {member.isCurrentUser && (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Tú
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progreso de la Ruta
              </span>
              <span className="text-xs font-bold text-primary">
                {progress.progressPercent}% completado
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
              <div className="rounded-xl border border-border/50 bg-background px-2.5 py-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Entregadas
                </span>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {progress.entregadasCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background px-2.5 py-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={12} className="text-amber-600" />
                  Pendientes
                </span>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {progress.pendientesCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background px-2.5 py-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Wallet size={12} className="text-primary" />
                  Por Cobrar
                </span>
                <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                  {formatPosCurrency(progress.montoPendiente)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
