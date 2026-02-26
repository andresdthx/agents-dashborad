"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

const statusLabel: Record<string, string> = {
  bot_active: "Bot activo",
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
  lost: "border-lead-hot/20 bg-lead-hot-surface text-lead-hot-text",
};

const statusDot: Record<string, string> = {
  bot_active: "bg-bot-active",
  human_active: "bg-bot-paused",
  resolved: "bg-ink-4",
  lost: "bg-lead-hot",
};

interface Props {
  leads: Pick<
    Lead,
    | "id"
    | "phone"
    | "classification"
    | "score"
    | "bot_paused"
    | "bot_paused_reason"
    | "status"
    | "created_at"
  >[];
  total: number;
  page: number;
  pageSize: number;
}

const rowTint: Record<string, string> = {
  hot: "bg-lead-hot-surface",
  warm: "bg-lead-warm-surface",
  cold: "bg-lead-cold-surface",
};

export function LeadsTable({ leads, total, page, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por teléfono..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => updateParam("search", e.target.value || undefined)}
          className="w-52 bg-surface-raised border-edge text-ink placeholder:text-ink-4 focus-visible:ring-signal"
        />

        <Select
          defaultValue={searchParams.get("classification") ?? "all"}
          onValueChange={(v) => updateParam("classification", v)}
        >
          <SelectTrigger className="w-36 border-edge bg-surface-raised text-ink focus:ring-signal">
            <SelectValue placeholder="Clasificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-44 border-edge bg-surface-raised text-ink focus:ring-signal">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="bot_active">Bot activo</SelectItem>
            <SelectItem value="human_active">Atención humana</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-ink-3 tabular-nums">
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-edge bg-surface-raised">
        <Table>
          <TableHeader>
            <TableRow className="border-edge hover:bg-transparent">
              <TableHead className="text-ink-3 font-medium">Teléfono</TableHead>
              <TableHead className="text-ink-3 font-medium">Clasificación</TableHead>
              <TableHead className="text-center text-ink-3 font-medium">Puntaje IA</TableHead>
              <TableHead className="text-ink-3 font-medium">Estado</TableHead>
              <TableHead className="text-ink-3 font-medium">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-ink-3"
                >
                  No hay leads que coincidan con los filtros
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={cn(
                    "cursor-pointer border-edge transition-colors hover:brightness-110",
                    lead.classification && rowTint[lead.classification]
                  )}
                >
                  <TableCell>
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="font-medium text-ink hover:text-signal transition-colors"
                    >
                      {lead.phone}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ClassificationBadge classification={lead.classification} />
                  </TableCell>
                  <TableCell className="text-center">
                    {lead.score !== null ? (
                      <div className="inline-flex flex-col items-center gap-1">
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
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyle[lead.status] ?? statusStyle.bot_active}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[lead.status] ?? statusDot.bot_active}`} />
                      {statusLabel[lead.status] ?? lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-ink-3">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
              className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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
