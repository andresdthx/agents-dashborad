"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  badge?: number;
}

interface Props {
  clientId: string;
  activeFaqsCount: number;
}

export function ClientTabNav({ clientId, activeFaqsCount }: Props) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
      href: `/admin/clients/${clientId}`,
      label: "Configuración general",
    },
    {
      href: `/admin/clients/${clientId}/agent`,
      label: "Agente",
    },
    {
      href: `/admin/clients/${clientId}/faqs`,
      label: "Preguntas frecuentes",
      badge: activeFaqsCount,
    },
  ];

  return (
    <div className="border-b border-edge">
      <nav className="-mb-px flex gap-0" aria-label="Secciones del cliente">
        {tabs.map((tab) => {
          // Exact match para la ruta raíz del cliente, startsWith para sub-rutas
          const isActive =
            tab.href === `/admin/clients/${clientId}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-signal text-ink"
                  : "border-transparent text-ink-3 hover:border-edge-strong hover:text-ink-2"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums min-w-[1.25rem]",
                    isActive
                      ? "bg-signal text-signal-fg"
                      : "bg-surface-raised text-ink-3"
                  )}
                  aria-label={`${tab.badge} preguntas activas`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
