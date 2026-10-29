"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReceiptText,
  LogOut,
  LayoutDashboard,
  User,
  Shield,
  Loader2,
} from "lucide-react";
import { getCurrentUserProfile, logout } from "@/services/auth.service";
import { PosInterface } from "@/components/facturation/PosInterface";
import type { UserProfile } from "@/types/auth";

export default function FacturationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUserProfile().then((p) => {
      if (!p || (p.rol !== "facturation" && p.rol !== "admin")) {
        router.replace("/");
        return;
      }
      setProfile(p);
      setChecking(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">Cargando terminal POS...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top POS Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-card/80 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <ReceiptText size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-foreground">
                Rutea POS
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Preventa Activa
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-accent/40 px-3 py-1.5 border border-border/30 text-xs">
            <User size={13} className="text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-[150px]">
              {profile.nombre ? `${profile.nombre} ${profile.apellido ?? ""}`.trim() : profile.email}
            </span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              ({profile.rol})
            </span>
          </div>

          {profile.rol === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <PosInterface currentUser={profile} />
      </main>
    </div>
  );
}
