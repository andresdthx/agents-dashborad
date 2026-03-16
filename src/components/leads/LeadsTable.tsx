"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useRef } from "react";
import type { Lead } from "@/types/database";
import { ClassificationBadge } from "./ClassificationBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Phone,
  CalendarDays,
} from "lucide-react";
import { HandoffBadge } from "./HandoffBadge";
import { BotToggleButton } from "./BotToggleButton";

const statusLabel: Record<string, string> = {
  bot_active: "Agente activo",
  human_active: "Atención humana",
  resolved: "Resuelto",
  lost: "Perdido",
};

const statusStyle: Record<string, string> = {
  bot_active:
    "border-bot-active/25 bg-bot-active-surface text-bot-active-text",
  human_active:
    "border-bot-paused/25 bg-bot-paused-surface text-bot-paused-text",
  resolved: "border-edge bg-surface text-ink-3",
  lost: "border-edge bg-surface text-ink-3",
};

const statusDot: Record<string, string> = {
  bot_active: "bg-bot-active",
  human_active: "bg-bot-paused",
  resolved: "bg-ink-4",
  lost: "bg-ink-4",
};

const statusDotAnimate: Record<string, boolean> = {
  bot_active: true,
  human_active: true,
  resolved: false,
  lost: false,
};

type SortField = "name" | "score" | "created_at" | "classification";

interface Props {
  leads: Pick<
    Lead,
    | "id"
    | "phone"
    | "name"
    | "classification"
    | "score"
    | "bot_paused"
    | "bot_paused_reason"
    | "status"
    | "handoff_mode"
    | "handoff_reason"
    | "created_at"
    | "order_confirmed_at"
  >[];
  total: number;
  page: number;
  pageSize: number;
}


export function LeadsTable({ leads, total, page, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        updateParam("search", value || undefined);
      }, 350);
    },
    [updateParam]
  );

  const currentSortBy = (searchParams.get("sortBy") as SortField | null) ?? "name";
  const currentSortDir =
    searchParams.get("sortDir") ?? (currentSortBy === "name" ? "asc" : "desc");

  const handleSort = useCallback(
    (field: SortField) => {
      const params = new URLSearchParams(searchParams.toString());
      if (currentSortBy === field) {
        params.set("sortDir", currentSortDir === "asc" ? "desc" : "asc");
      } else {
        params.set("sortBy", field);
        params.set("sortDir", field === "name" ? "asc" : "desc");
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, currentSortBy, currentSortDir]
  );

  function SortIcon({ field }: { field: SortField }) {
    if (currentSortBy !== field)
      return <ArrowUpDown className="ml-1 inline h-3 w-3 text-ink-4" />;
    return currentSortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-signal" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-signal" />
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      {/* Filters — card wrapper */}
      <div className="rounded-2xl border border-edge bg-surface-raised p-4 shadow-sm">
        {/* Desktop: single flex row. Mobile: search full-width + 2-col grid for filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search — full width on mobile, flex-1 on desktop */}
          <div className="relative w-full sm:min-w-[200px] sm:flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por teléfono o nombre..."
              defaultValue={searchParams.get("search") ?? ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full border-edge bg-canvas pl-8 text-ink placeholder:text-ink-4 focus-visible:ring-signal"
            />
          </div>

          {/* Dropdowns — 2-col grid on mobile, inline flex items on desktop */}
          <div className="grid grid-cols-2 gap-2 sm:contents">
            {/* Clasificación */}
            <Select
              defaultValue={searchParams.get("classification") ?? "all"}
              onValueChange={(v) => updateParam("classification", v)}
            >
              <SelectTrigger className="w-full sm:w-32 border-edge bg-canvas text-ink focus:ring-signal">
                <SelectValue placeholder="Clasificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Clasificación</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            {/* Estado */}
            <Select
              defaultValue={searchParams.get("status") ?? "all"}
              onValueChange={(v) => updateParam("status", v)}
            >
              <SelectTrigger className="w-full sm:w-36 border-edge bg-canvas text-ink focus:ring-signal">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Estado</SelectItem>
                <SelectItem value="bot_active">Agente activo</SelectItem>
                <SelectItem value="human_active">Atención humana</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>

            {/* Handoff */}
            <Select
              defaultValue={searchParams.get("handoffMode") ?? "all"}
              onValueChange={(v) => updateParam("handoffMode", v)}
            >
              <SelectTrigger className="w-full sm:w-28 border-edge bg-canvas text-ink focus:ring-signal">
                <SelectValue placeholder="Handoff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Handoff</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="requested">Solicitado</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="observer">Observador</SelectItem>
              </SelectContent>
            </Select>

            {/* Puntaje mínimo */}
            <div className="flex items-center overflow-hidden rounded-md border border-edge bg-canvas">
              <span className="border-r border-edge px-2.5 text-[11px] font-medium text-ink-3 whitespace-nowrap">
                Puntaje IA
              </span>
              <Input
                id="filter-min-score"
                type="number"
                min={0}
                max={100}
                placeholder="0"
                defaultValue={searchParams.get("minScore") ?? ""}
                onChange={(e) => updateParam("minScore", e.target.value || undefined)}
                className="w-14 border-0 bg-transparent text-center text-ink shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-ink-4" aria-hidden="true" />
            <Input
              id="filter-date-from"
              type="date"
              defaultValue={searchParams.get("dateFrom") ?? ""}
              onChange={(e) => updateParam("dateFrom", e.target.value || undefined)}
              className="w-full sm:w-32 border-edge bg-canvas text-ink focus-visible:ring-signal"
              aria-label="Fecha desde"
            />
            <span className="text-xs text-ink-4">a</span>
            <Input
              id="filter-date-to"
              type="date"
              defaultValue={searchParams.get("dateTo") ?? ""}
              onChange={(e) => updateParam("dateTo", e.target.value || undefined)}
              className="w-full sm:w-32 border-edge bg-canvas text-ink focus-visible:ring-signal"
              aria-label="Fecha hasta"
            />
          </div>
        </div>

        {/* Result count */}
        <div className="mt-3 flex items-center justify-end border-t border-edge pt-3">
          <span className="text-xs tabular-nums text-ink-3">
            {total} resultado{total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-raised shadow-md font-sans"><div className="overflow-x-auto px-6">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                <button
                  onClick={() => handleSort("name")}
                  className="inline-flex items-center transition-colors hover:text-ink"
                  aria-label="Ordenar por nombre"
                >
                  Nombre
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                Teléfono
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                <button
                  onClick={() => handleSort("classification")}
                  className="inline-flex items-center transition-colors hover:text-ink"
                  aria-label="Ordenar por clasificación"
                >
                  Clasificación
                  <SortIcon field="classification" />
                </button>
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                <button
                  onClick={() => handleSort("score")}
                  className="inline-flex items-center transition-colors hover:text-ink"
                  aria-label="Ordenar por puntaje IA"
                >
                  Puntaje IA
                  <SortIcon field="score" />
                </button>
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                Estado
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                Handoff
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                <button
                  onClick={() => handleSort("created_at")}
                  className="inline-flex items-center transition-colors hover:text-ink"
                  aria-label="Ordenar por fecha"
                >
                  Fecha
                  <SortIcon field="created_at" />
                </button>
              </TableHead>
              <TableHead className="py-4 text-xs font-semibold text-ink-3">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sm text-ink-3"
                >
                  No hay leads que coincidan con los filtros
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer border-0 transition-colors hover:bg-canvas [&>td]:py-4"
                >
                  {/* Nombre */}
                  <TableCell>
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="font-semibold text-ink transition-colors hover:text-signal"
                    >
                      {lead.name ?? <span className="font-normal text-ink-4">—</span>}
                    </Link>
                  </TableCell>

                  {/* Teléfono */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0 text-ink-4" aria-hidden="true" />
                      <span className="font-mono text-xs tabular-nums text-ink-3">
                        {lead.phone}
                      </span>
                    </span>
                  </TableCell>

                  {/* Clasificación */}
                  <TableCell>
                    <ClassificationBadge
                      classification={lead.classification}
                      confirmed={
                        lead.classification === "hot"
                          ? (lead.score ?? 0) >= 100 || lead.order_confirmed_at !== null
                          : undefined
                      }
                    />
                  </TableCell>

                  {/* Puntaje IA */}
                  <TableCell>
                    {lead.score !== null ? (
                      <div className="inline-flex flex-col items-start gap-1">
                        <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                          {lead.score}
                        </span>
                        <div className="h-0.5 w-10 overflow-hidden rounded-full bg-edge-strong">
                          <div
                            className="h-0.5 rounded-full bg-signal"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        statusStyle[lead.status] ?? statusStyle.bot_active
                      )}
                    >
                      {statusDotAnimate[lead.status] ? (
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span
                            className={cn(
                              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                              statusDot[lead.status] ?? statusDot.bot_active
                            )}
                          />
                          <span
                            className={cn(
                              "relative inline-flex h-1.5 w-1.5 rounded-full",
                              statusDot[lead.status] ?? statusDot.bot_active
                            )}
                          />
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            statusDot[lead.status] ?? statusDot.bot_active
                          )}
                        />
                      )}
                      {statusLabel[lead.status] ?? lead.status}
                    </span>
                  </TableCell>

                  {/* Handoff */}
                  <TableCell>
                    <HandoffBadge
                      handoffMode={lead.handoff_mode}
                      handoffReason={lead.handoff_reason}
                      botPausedReason={lead.bot_paused_reason}
                    />
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        className="h-3 w-3 shrink-0 text-ink-4"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs tabular-nums text-ink-3">
                        {formatDate(lead.created_at)}
                      </span>
                    </span>
                  </TableCell>

                  {/* Acción */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <BotToggleButton
                      leadId={lead.id}
                      botPaused={lead.bot_paused}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div></div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span className="tabular-nums">
            Página {page} de {totalPages}
            <span className="ml-1.5 text-ink-4">
              · {total} resultado{total !== 1 ? "s" : ""}
            </span>
          </span>
          <div className="flex gap-1.5">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => updateParam("page", String(page + 1))}
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
