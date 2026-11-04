import type { Metadata } from "next";
import { LoginForm } from "@rutea/shared";

export const metadata: Metadata = {
  title: "Iniciar sesión — Rutea",
  description: "Accede a tu cuenta de Rutea para gestionar pedidos y entregas.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-background"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Rutea - Alistamiento
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión para continuar
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card px-8 py-8 shadow-sm">
          <LoginForm
            allowedRoles={["admin", "picker"]}
            roleRedirects={{
              admin: "/admin",
              picker: "/picking",
            }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Problemas para acceder? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}
