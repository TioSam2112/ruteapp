"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { logout } from "@rutea/shared";
import { Tooltip } from "@rutea/shared";
import { ADMIN_NAV_GROUPS } from "@/constants/navigation";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`
        relative flex h-full flex-col border-r border-border/40 bg-sidebar
        backdrop-blur-md transition-all duration-300 ease-in-out
        ${isExpanded ? "w-56" : "w-[60px]"}
      `}
    >
      <div className="flex h-14 items-center border-b border-border/40 px-3">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {isExpanded ? (
            <PanelLeftClose size={18} strokeWidth={1.5} />
          ) : (
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          )}
        </button>

        {isExpanded && (
          <span className="ml-2 truncate text-sm font-semibold tracking-tight text-foreground">
            Rutea
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 py-4">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            {isExpanded && (
              <span className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.title}
              </span>
            )}

            {group.items.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              const linkContent = (
                <Link
                  href={href}
                  className={`
                    flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium
                    transition-colors duration-150
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                    ${!isExpanded ? "justify-center" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2 : 1.5}
                    className="shrink-0"
                  />
                  {isExpanded && <span className="truncate">{label}</span>}
                </Link>
              );

              return isExpanded ? (
                <div key={href}>{linkContent}</div>
              ) : (
                <Tooltip key={href} content={label} side="right">
                  {linkContent}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border/40 px-2 py-3">
        {isExpanded ? (
          <button
            onClick={handleLogout}
            className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        ) : (
          <Tooltip content="Cerrar sesión" side="right">
            <button
              onClick={handleLogout}
              className="flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
