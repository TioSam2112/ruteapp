import type { Metadata } from "next";
import { Truck, MapPin, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Workspace de Rutas y Entregas — Rutea",
  description: "Gestión operativa de entregas por población, confirmación de pedidos y recaudo.",
};

export const instant = false;

export default function DeliveryWorkspacePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Truck size={28} strokeWidth={1.8} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Workspace de Rutas y Entregas
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Desde aquí gestionarás las facturas listas para reparto agrupadas por población,
            registrarás los métodos de pago y realizarás el cuadre de caja de la ruta.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/60 p-4 text-center">
            <MapPin size={18} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Rutas por Población</span>
            <span className="text-[11px] text-muted-foreground">
              Facturas en estado Listo para Reparto
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/60 p-4 text-center">
            <Truck size={18} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Entrega & Novedades</span>
            <span className="text-[11px] text-muted-foreground">
              Confirmación de entrega y devoluciones
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/60 p-4 text-center">
            <Wallet size={18} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Recaudo & Cuadre</span>
            <span className="text-[11px] text-muted-foreground">
              Efectivo, transferencia y crédito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

