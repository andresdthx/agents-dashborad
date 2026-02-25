"use client";

import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

interface NotificationBellProps {
  clientId: string | null;
}

export function NotificationBell({ clientId }: NotificationBellProps) {
  const { notifications, clearNotifications, markAllRead, unread } = useRealtimeNotifications(clientId);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) markAllRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-md p-1.5 text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-lead-hot text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold text-ink">Notificaciones</span>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs text-ink-3 hover:text-ink-2"
            >
              Limpiar
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-ink-3">
            Sin notificaciones nuevas
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={`/dashboard/leads/${n.leadId}`} className="cursor-pointer">
                <div className="flex w-full flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {n.type === "hot_lead" ? (
                      <Badge className="border border-lead-hot/30 bg-lead-hot-surface text-lead-hot-text text-xs hover:bg-lead-hot-surface">
                        Lead hot
                      </Badge>
                    ) : (
                      <Badge className="border border-bot-paused/30 bg-bot-paused-surface text-bot-paused-text text-xs hover:bg-bot-paused-surface">
                        Bot pausado
                      </Badge>
                    )}
                    <span className="text-xs text-ink-3">
                      {formatDistanceToNow(n.timestamp)}
                    </span>
                  </div>
                  <span className="text-sm text-ink-2">{n.phone}</span>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
