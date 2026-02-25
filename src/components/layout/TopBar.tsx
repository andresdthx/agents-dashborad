"use client";

import { useEffect, useState } from "react";
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
import { LogOut, Moon, Sun } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

interface TopBarProps {
  userEmail: string;
  clientId: string | null;
}

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/leads": "Leads",
  "/admin/clients": "Clientes",
};

function getPageLabel(pathname: string): string {
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return label;
    }
  }
  return "Dashboard";
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Placeholder del mismo tamaño para evitar layout shift durante hidratación
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
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function TopBar({ userEmail, clientId }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageLabel = getPageLabel(pathname);

  async function handleSignOut() {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-edge bg-canvas px-5">
      <span className="text-sm font-medium text-ink-2">{pageLabel}</span>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell clientId={clientId} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-signal">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-surface-raised text-[11px] text-ink-2">
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
