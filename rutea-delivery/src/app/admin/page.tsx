import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Rutea Admin",
};

export const instant = false;

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard de Reparto & Entregas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general de la operación de reparto, rutas y cuadre de caja.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Entregas del día", value: "—" },
          { label: "Rutas en curso", value: "—" },
          { label: "Recaudo registrado", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

