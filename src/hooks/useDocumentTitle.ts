"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/leads": "Leads",
  "/dashboard/settings/agent": "Configuración · Agente",
  "/dashboard/settings/catalog": "Configuración · Catálogo",
  "/dashboard/settings/handoff": "Configuración · Transferencias",
  "/dashboard/settings/reservation": "Configuración · Reservas",
  "/dashboard/settings/schedule": "Configuración · Agenda",
  "/dashboard/settings/faqs": "Configuración · FAQs",
  "/admin/clients": "Clientes",
  "/admin/clients/new": "Nuevo cliente",
};

const APP_NAME = "AgentsLeads";

export function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Prefix match (handles /admin/clients/[id] and /dashboard/leads/[id])
  if (pathname.startsWith("/admin/clients/")) return "Editar cliente";
  if (pathname.startsWith("/dashboard/leads/")) return "Detalle de lead";

  return "Dashboard";
}

/**
 * Updates document.title to reflect the current page and unread notification count.
 * Format: "(3) Leads | AgentsLeads" or "Leads | AgentsLeads"
 */
export function useDocumentTitle(unread: number) {
  const pathname = usePathname();

  useEffect(() => {
    const pageTitle = getPageTitle(pathname);
    const prefix = unread > 0 ? `(${unread > 99 ? "99+" : unread}) ` : "";
    document.title = `${prefix}${pageTitle} | ${APP_NAME}`;
  }, [pathname, unread]);
}
