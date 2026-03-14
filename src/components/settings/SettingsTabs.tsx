"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Agente", href: "/dashboard/settings/agent", icon: Bot },
  { label: "Preguntas frecuentes", href: "/dashboard/settings/faqs", icon: MessageSquare },
  { label: "Transferencias", href: "/dashboard/settings/handoff", icon: ArrowLeftRight },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-0.5 border-b border-edge" aria-label="Secciones de configuración">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 text-sm transition-colors border-b-2 -mb-px",
              isActive
                ? "border-ink text-ink font-medium"
                : "border-transparent text-ink-3 hover:text-ink-2 hover:border-edge-strong"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
