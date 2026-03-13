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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  role: "super_admin" | "client_agent";
  userEmail?: string;
}

const clientLinks = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/leads", label: "Clientes", icon: Users },
];

const adminLinks = [{ href: "/admin/clients", label: "Clientes", icon: Building2 }];

const settingsLinks = [
  { href: "/dashboard/settings/agent", label: "Entrenar Agente", icon: Bot },
  { href: "/dashboard/settings/handoff", label: "Transferencias", icon: ArrowLeftRight },
  { href: "/dashboard/settings/faqs", label: "Preguntas frecuentes", icon: MessageSquare },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-signal/10 font-medium text-signal"
          : "text-ink-3 hover:bg-surface-raised hover:text-ink-2"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal" : "")} />
      {label}
    </Link>
  );
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "??";
  const shortEmail =
    userEmail && userEmail.length > 24 ? userEmail.slice(0, 22) + "…" : userEmail;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-edge bg-canvas">
      {/* Logomark */}
      <div className="flex h-14 items-center gap-2.5 border-b border-edge px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal shadow-sm">
          <Image
            src="/white-logo.png"
            alt="Avatha IA logo"
            width={20}
            height={20}
          />
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink">Avatha IA</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 pt-3">
        {clientLinks.map(({ href, label, icon, exact }) => (
          <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href, exact)} />
        ))}

        {role === "super_admin" && (
          <>
            <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-ink-4">
              Administración
            </div>
            {adminLinks.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
            ))}
          </>
        )}

        {role === "client_agent" && (
          <>
            <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-ink-4">
              Configuración
            </div>
            {settingsLinks.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} active={isActive(href)} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      {userEmail && (
        <div className="border-t border-edge p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[11px] font-semibold text-ink-2">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-ink-3">{shortEmail}</p>
              <p className="text-[10px] text-ink-4">
                {role === "super_admin" ? "Super Admin" : "Agente"}
              </p>
            </div>
            {role === "super_admin" && (
              <Shield className="h-3 w-3 shrink-0 text-signal opacity-60" />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
