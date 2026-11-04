"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@rutea/shared";
import { Sidebar } from "@/components/admin/Sidebar";
import type { UserProfile } from "@rutea/shared";

export default function FacturationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (checking) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}

