"use client";

import { useRouter } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";

export function LeadsPageHeader() {
  const router = useRouter();

  function handleExport() {
    // Trigger CSV export via current URL params
    const params = new URLSearchParams(window.location.search);
    params.set("export", "csv");
    window.location.href = `/api/leads/export?${params.toString()}`;
  }

  function handleRefresh() {
    router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-ink">Clientes</h1>
        <p className="mt-1 text-sm text-ink-3">
          Todos los leads calificados por el bot
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
          aria-label="Exportar leads como CSV"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar
        </button>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
          aria-label="Actualizar lista de leads"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Actualizar
        </button>
      </div>
    </div>
  );
}
