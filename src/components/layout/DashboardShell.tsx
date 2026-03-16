"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { X } from "lucide-react";

interface DashboardShellProps {
  role: "super_admin" | "client_agent";
  userEmail: string;
  clientId: string | null;
  children: React.ReactNode;
}

export function DashboardShell({ role, userEmail, clientId, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar role={role} userEmail={userEmail} />
      </div>

      {/* Mobile drawer overlay — only mounted when open */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 h-full overflow-hidden">
            <Sidebar role={role} userEmail={userEmail} />

            {/* Close button — outside sidebar to avoid layout conflicts */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-surface-raised text-ink-3 shadow-sm hover:bg-surface-overlay hover:text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label="Cerrar menú"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          userEmail={userEmail}
          clientId={clientId}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 px-4 sm:px-8 md:px-14 lg:px-28">
          {children}
        </main>
      </div>
    </div>
  );
}
