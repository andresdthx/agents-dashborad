"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Bot,
  ArrowLeftRight,
  Shield,
  CalendarCheck,
  TableProperties,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface SidebarProps {
  role: "super_admin" | "client_agent";
  userEmail?: string;
}

const clientLinks = (role: "super_admin" | "client_agent") => [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: role === "super_admin" ? "Leads" : "Clientes", icon: Users },
];

const adminLinks = [{ href: "/admin/clients", label: "Clientes", icon: Building2 }];

const settingsLinks = [
  { href: "/dashboard/settings/agent", label: "Entrenar Agente", icon: Bot },
  { href: "/dashboard/settings/reservation", label: "Campos de confirmación", icon: CalendarCheck },
  { href: "/dashboard/settings/handoff", label: "Transferencias", icon: ArrowLeftRight },
  { href: "/dashboard/settings/faqs", label: "Preguntas frecuentes", icon: MessageSquare },
  { href: "/dashboard/settings/catalog", label: "Columnas del Sheet", icon: TableProperties },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
        collapsed ? "justify-center px-2" : "",
        active
          ? "bg-signal/15 font-medium text-signal"
          : "text-ink-3 dark:text-zinc-300 hover:bg-surface-raised hover:text-ink-2 dark:hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal" : "")} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "??";
  const shortEmail =
    userEmail && userEmail.length > 24 ? userEmail.slice(0, 22) + "…" : userEmail;

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-edge bg-surface transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logomark */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-edge",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-signal shadow-sm">
          <Image
            src="/white-logo.png"
            alt="Avatha IA logo"
            width={20}
            height={20}
          />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-ink">Avatha IA</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 pt-3">
        {clientLinks(role).map(({ href, label, icon, exact }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isActive(href, exact)}
            collapsed={collapsed}
          />
        ))}

        {role === "super_admin" && (
          <>
            {!collapsed && (
              <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-ink-4 dark:text-zinc-500">
                Administración
              </div>
            )}
            {collapsed && <div className="my-3 h-px bg-edge" />}
            {adminLinks.map(({ href, label, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={isActive(href)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}

        {role === "client_agent" && (
          <>
            {!collapsed && (
              <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-ink-4 dark:text-zinc-500">
                Configuración
              </div>
            )}
            {collapsed && <div className="my-3 h-px bg-edge" />}
            {settingsLinks.map(({ href, label, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={isActive(href)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      {userEmail && (
        <div className="border-t border-edge p-3">
          <div
            className={cn(
              "flex items-center rounded-lg px-2 py-2",
              collapsed ? "justify-center" : "gap-2.5"
            )}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/15 text-[11px] font-semibold text-signal"
              title={collapsed ? userEmail : undefined}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-ink-3 dark:text-zinc-300">{shortEmail}</p>
                <p className="text-[10px] text-ink-4 dark:text-zinc-500">
                  {role === "super_admin" ? "Super Admin" : "Agente"}
                </p>
              </div>
            )}
            {!collapsed && role === "super_admin" && (
              <Shield className="h-3 w-3 shrink-0 text-signal opacity-60" />
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className={cn(
          "absolute -right-3 top-[60px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-edge bg-surface-raised text-ink-3 shadow-sm transition-colors hover:bg-surface-overlay hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
        )}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
