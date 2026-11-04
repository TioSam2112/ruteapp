"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile, type UserProfile } from "@rutea/shared";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUserProfile().then((p) => {
      if (!p || p.rol !== "admin") {
        router.replace("/");
        return;
      }
      setProfile(p);
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex min-h-full bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}
