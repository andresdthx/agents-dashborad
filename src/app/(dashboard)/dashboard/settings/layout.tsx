import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="shrink-0 pb-5">
        <h1 className="text-lg font-semibold text-ink">Configuración</h1>
        <p className="mt-0.5 text-sm text-ink-3">
          Personaliza el comportamiento y las reglas de tu agente de ventas.
        </p>
      </div>

      {/* Tab navigation */}
      <SettingsTabs />

      {/* Content — flex-1 para que la página hija pueda llenar el alto restante */}
      <div className="min-h-0 flex-1 pt-6">{children}</div>
    </div>
  );
}
