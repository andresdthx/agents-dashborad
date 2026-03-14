import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {/* Page header */}
      <div className="pb-5">
        <h1 className="text-lg font-semibold text-ink">Configuración</h1>
        <p className="mt-0.5 text-sm text-ink-3">
          Personaliza el comportamiento y las reglas de tu agente de ventas.
        </p>
      </div>

      {/* Tab navigation */}
      <SettingsTabs />

      {/* Content */}
      <div className="pt-6">{children}</div>
    </div>
  );
}
