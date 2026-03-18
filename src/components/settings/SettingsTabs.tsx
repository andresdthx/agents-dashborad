"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, ArrowLeftRight, CalendarCheck, TableProperties, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Agente", href: "/dashboard/settings/agent", icon: Bot },
  { label: "Campos de confirmación", href: "/dashboard/settings/reservation", icon: CalendarCheck },
  { label: "Agenda", href: "/dashboard/settings/schedule", icon: Clock },
  { label: "Transferencias", href: "/dashboard/settings/handoff", icon: ArrowLeftRight },
  { label: "Preguntas frecuentes", href: "/dashboard/settings/faqs", icon: MessageSquare },
  { label: "Columnas del Sheet", href: "/dashboard/settings/catalog", icon: TableProperties },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-end gap-1 border-b border-edge px-4 pt-2" aria-label="Secciones de configuración">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-2.5 text-sm transition-colors rounded-t-lg whitespace-nowrap select-none",
              isActive
                ? "text-ink font-medium"
                : "text-ink-3 hover:text-ink hover:bg-surface-raised/60"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "text-signal" : "text-ink-4 group-hover:text-ink-3")}
              aria-hidden="true"
            />
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-signal" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
