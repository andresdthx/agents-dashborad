import Link from "next/link";
import type { Client } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Pencil } from "lucide-react";

type ClientRow = Pick<
  Client,
  "id" | "name" | "business_type" | "active" | "channel_phone_number" | "product_mode" | "created_at"
>;

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-edge bg-surface-raised">
      <Table>
        <TableHeader>
          <TableRow className="border-edge hover:bg-transparent">
            <TableHead className="font-medium text-ink-3">Nombre</TableHead>
            <TableHead className="font-medium text-ink-3">Teléfono canal</TableHead>
            <TableHead className="font-medium text-ink-3">Modo</TableHead>
            <TableHead className="font-medium text-ink-3">Estado</TableHead>
            <TableHead className="font-medium text-ink-3">Creado</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-12 text-center text-sm text-ink-3"
              >
                No hay clientes aún
              </TableCell>
            </TableRow>
          ) : (
            clients.map((c) => (
              <TableRow key={c.id} className="border-edge">
                <TableCell className="font-medium text-ink">{c.name}</TableCell>
                <TableCell className="font-mono text-sm tabular-nums text-ink-2">
                  {c.channel_phone_number}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md border border-edge px-2 py-0.5 text-xs font-medium capitalize text-ink-2">
                    {c.product_mode}
                  </span>
                </TableCell>
                <TableCell>
                  {c.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-bot-active/25 bg-bot-active-surface px-2 py-0.5 text-xs font-medium text-bot-active-text">
                      <span className="h-1.5 w-1.5 rounded-full bg-bot-active" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2 py-0.5 text-xs font-medium text-ink-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-4" />
                      Inactivo
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-ink-3">
                  {formatDate(c.created_at)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
