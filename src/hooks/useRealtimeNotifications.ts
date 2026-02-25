"use client";

import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

const STORAGE_KEY = "agentsleads:notifications";

export interface Notification {
  id: string;
  type: "hot_lead" | "bot_paused";
  leadId: string;
  phone: string;
  timestamp: Date;
  read: boolean;
}

function loadFromStorage(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<
      Omit<Notification, "timestamp"> & { timestamp: string }
    >;
    return parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
  } catch {
    return [];
  }
}

function saveToStorage(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore quota errors
  }
}

/**
 * Subscribes to Supabase Realtime for lead events.
 * - clientId = null → super_admin watching all clients
 * - clientId = UUID → client_agent watching their own client
 *
 * Fixes:
 * - Notifications persisted in localStorage across page refreshes
 * - Double-fire prevention: hot_lead UPDATE returns early (skips bot_paused check)
 * - Auto-dismiss bot_paused notifications when bot is reactivated
 * - read/unread tracking; markAllRead() to zero the badge without clearing the list
 */
export function useRealtimeNotifications(clientId: string | null) {
  const initialized = useRef(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persist to localStorage whenever notifications change (skip until after hydration)
  useEffect(() => {
    if (!initialized.current) return;
    saveToStorage(notifications);
  }, [notifications]);

  // Load from localStorage after mount (client-only, avoids SSR hydration mismatch)
  useEffect(() => {
    initialized.current = true;
    const stored = loadFromStorage();
    if (stored.length > 0) {
      setNotifications(stored);
    }
  }, []);

  useEffect(() => {
    const supabase = getBrowserClient();
    const filter = clientId ? `client_id=eq.${clientId}` : undefined;

    const channel = supabase
      .channel("lead-notifications")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          ...(filter ? { filter } : {}),
        },
        (payload: { new: { id: string; phone: string; classification: string } }) => {
          const record = payload.new;
          if (record.classification === "hot") {
            setNotifications((prev) =>
              [
                {
                  id: crypto.randomUUID(),
                  type: "hot_lead" as const,
                  leadId: record.id,
                  phone: record.phone,
                  timestamp: new Date(),
                  read: false,
                },
                ...prev,
              ].slice(0, 20)
            );
          }
        }
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "leads",
          ...(filter ? { filter } : {}),
        },
        (payload: {
          new: { id: string; phone: string; classification: string | null; bot_paused: boolean };
          old: { classification: string | null; bot_paused: boolean };
        }) => {
          const { new: record, old } = payload;

          // Classification changed to hot: emit once and return immediately.
          // The early return prevents the bot_paused check below from firing
          // on the same event (double-fire fix).
          if (record.classification === "hot" && old.classification !== "hot") {
            setNotifications((prev) =>
              [
                {
                  id: crypto.randomUUID(),
                  type: "hot_lead" as const,
                  leadId: record.id,
                  phone: record.phone,
                  timestamp: new Date(),
                  read: false,
                },
                ...prev,
              ].slice(0, 20)
            );
            return;
          }

          // Bot just got paused: add a bot_paused notification
          if (record.bot_paused && !old.bot_paused) {
            setNotifications((prev) =>
              [
                {
                  id: crypto.randomUUID(),
                  type: "bot_paused" as const,
                  leadId: record.id,
                  phone: record.phone,
                  timestamp: new Date(),
                  read: false,
                },
                ...prev,
              ].slice(0, 20)
            );
          }

          // Bot reactivated: auto-dismiss all bot_paused notifications for this lead
          if (!record.bot_paused && old.bot_paused) {
            setNotifications((prev) =>
              prev.filter((n) => !(n.type === "bot_paused" && n.leadId === record.id))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const clearNotifications = () => setNotifications([]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unread = notifications.filter((n) => !n.read).length;

  return { notifications, clearNotifications, markAllRead, unread };
}
