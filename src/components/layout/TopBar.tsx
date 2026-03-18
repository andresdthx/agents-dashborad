"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Moon, Sun, Menu, ArrowLeft } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useDocumentTitle, getPageTitle } from "@/hooks/useDocumentTitle";

interface TopBarProps {
  userEmail: string;
  clientId: string | null;
  onMenuOpen?: () => void;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="h-7 w-7" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md p-1.5 text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export function TopBar({ userEmail, clientId, onMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageLabel = getPageTitle(pathname);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const raw = d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    setDateStr(raw.charAt(0).toUpperCase() + raw.slice(1));
  }, []);

  const handleLeadChange = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      router.refresh();
    }, 2000);
  }, [router]);

  const { playNotificationSound } = useNotificationSound();
  const { notifications, clearNotifications, markAllRead, unread } = useRealtimeNotifications(
    clientId,
    { onDataChange: handleLeadChange, onNewNotification: playNotificationSound }
  );

  // Actualiza document.title con el conteo de no leídas
  useDocumentTitle(unread);

  async function handleSignOut() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const showBack =
    pathname.startsWith("/dashboard/leads/") ||
    pathname.startsWith("/admin/clients/");

  const localPart = userEmail.split("@")[0] ?? userEmail;
  const initials = localPart.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-edge bg-canvas px-5 shadow-[0_1px_0_0_var(--color-edge-subtle)]">
      <div className="flex items-center gap-3">
        {onMenuOpen && (
          <button
            onClick={onMenuOpen}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {showBack && (
          <Link
            href="/dashboard"
            aria-label="Volver al dashboard"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-raised hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <Link href="/dashboard" className="flex items-center">
          <span className="text-base font-semibold text-ink">{pageLabel}</span>
        </Link>
        {dateStr && (
          <>
            <span className="hidden text-ink-4 sm:block">·</span>
            <span className="hidden text-sm text-ink-3 sm:block">{dateStr}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationBell
          notifications={notifications}
          unread={unread}
          clearNotifications={clearNotifications}
          markAllRead={markAllRead}
        />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-signal">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-surface-raised text-[12px] font-semibold text-ink-2">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5 text-xs text-ink-3">{userEmail}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
