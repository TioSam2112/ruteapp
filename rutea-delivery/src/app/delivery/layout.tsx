"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  LogOut,
  LayoutDashboard,
  User,
  Loader2,
} from "lucide-react";
import {
  getCurrentUserProfile,
  getUserFullName,
  logout,
  type UserProfile,
} from "@rutea/shared";

interface DeliveryLayoutProps {
  children: ReactNode;
}

export default function DeliveryLayout({ children }: DeliveryLayoutProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUserProfile(["admin", "delivery"]).then((userProfile) => {
      if (!active) return;

      if (!userProfile || (userProfile.rol !== "admin" && userProfile.rol !== "delivery")) {
        router.replace("/");
        return;
      }

      setProfile(userProfile);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs font-medium tracking-tight">
            Verificando sesión de reparto…
          </span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const displayUserName =
    profile.nombre || profile.apellido
      ? getUserFullName(profile)
      : profile.email;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card/80 px-4 backdrop-blur-xl saturate-150 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Truck size={17} strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Rutea • Entregas y Reparto
            </span>
            <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-tight text-emerald-600 sm:inline-flex">
              En línea
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-accent/60 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5">
            <User size={13} className="shrink-0 text-muted-foreground" />
            <span className="max-w-[120px] truncate font-medium text-foreground sm:max-w-[180px]">
              {displayUserName}
            </span>
          </div>

          {profile.rol === "admin" && (
            <Link
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all duration-150 hover:bg-accent active:scale-[0.97]"
            >
              <LayoutDashboard size={13.5} />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] sm:px-3"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

