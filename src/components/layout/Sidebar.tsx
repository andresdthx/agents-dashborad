"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "super_admin" | "client_agent";
}

const clientLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
];

const adminLinks = [
  { href: "/admin/clients", label: "Clientes", icon: Building2 },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-edge bg-canvas">
      {/* Logomark */}
      <div className="flex h-14 items-center gap-2.5 border-b border-edge px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal">
          <Zap className="h-4 w-4 text-signal-fg" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink">AgentsLeads</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {clientLinks.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(href, exact)
                ? "bg-surface-raised text-ink"
                : "text-ink-3 hover:bg-surface hover:text-ink-2"
            )}
          >
            {isActive(href, exact) && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-signal" />
            )}
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {role === "super_admin" && (
          <>
            <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-ink-4">
              Administración
            </div>
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive(href)
                    ? "bg-surface-raised text-ink"
                    : "text-ink-3 hover:bg-surface hover:text-ink-2"
                )}
              >
                {isActive(href) && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-signal" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
