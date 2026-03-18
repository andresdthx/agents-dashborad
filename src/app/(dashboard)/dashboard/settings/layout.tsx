export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      <div className="pb-6">
        <h1 className="text-lg font-semibold text-ink">Configuración</h1>
        <p className="mt-0.5 text-sm text-ink-3">
          Personaliza el comportamiento y las reglas de tu agente de ventas.
        </p>
      </div>

      <div className="rounded-xl border border-edge bg-surface-raised overflow-hidden shadow-sm">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
