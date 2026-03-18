"use client";

import type { Notification } from "@/hooks/useRealtimeNotifications";
import { Bell, CalendarX, Flame, PauseCircle, BellOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  notifications: Notification[];
  unread: number;
  clearNotifications: () => void;
  markAllRead: () => void;
}

const TYPE_CONFIG = {
  hot_lead: {
    icon: Flame,
    iconClass: "text-lead-hot",
    bgClass: "bg-lead-hot/10",
    label: "Lead caliente",
    dotClass: "bg-lead-hot",
  },
  bot_paused: {
    icon: PauseCircle,
    iconClass: "text-bot-paused-text",
    bgClass: "bg-bot-paused-surface",
    label: "Agente pausado",
    dotClass: "bg-bot-paused-text",
  },
  calendar_error: {
    icon: CalendarX,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    label: "Error en calendario",
    dotClass: "bg-destructive",
  },
} as const;

function NotificationItem({ n, isUnread }: { n: Notification; isUnread: boolean }) {
  const config = TYPE_CONFIG[n.type];
  const Icon = config.icon;

  return (
    <Link
      href={`/dashboard/leads/${n.leadId}`}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-overlay focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal",
        isUnread && "bg-signal/[0.03]"
      )}
    >
      {/* Type icon */}
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.bgClass)}>
        <Icon className={cn("h-4 w-4", config.iconClass)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className={cn("truncate text-sm", isUnread ? "font-semibold text-ink" : "font-medium text-ink-2")}>
            {n.name ?? n.phone}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-ink-4">
            {formatDistanceToNow(n.timestamp)}
          </span>
        </div>
        <span className={cn("text-xs", config.iconClass, "opacity-80")}>
          {config.label}
        </span>
        {n.type === "calendar_error" && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-4">
            El evento no se creó. El cliente debe agendar manualmente.
          </p>
        )}
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", config.dotClass)} aria-label="No leído" />
      )}
    </Link>
  );
}

export function NotificationBell({
  notifications,
  unread,
  clearNotifications,
  markAllRead,
}: NotificationBellProps) {
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) markAllRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          aria-label={unread > 0 ? `${unread} notificaciones sin leer` : "Notificaciones"}
          className="relative rounded-md p-1.5 text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal text-[10px] font-bold text-white"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">Notificaciones</span>
            {unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-[11px] font-semibold text-white">
                {unread}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="rounded px-2 py-0.5 text-xs text-ink-3 transition-colors hover:bg-surface-overlay hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <BellOff className="h-5 w-5 text-ink-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-ink-3">Sin notificaciones</p>
            <p className="text-xs text-ink-4">Te avisaremos cuando haya actividad.</p>
          </div>
        ) : (
          <div className="max-h-[400px] divide-y divide-edge overflow-y-auto">
            {notifications.map((n, i) => (
              <NotificationItem key={n.id} n={n} isUnread={i < unread} />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
