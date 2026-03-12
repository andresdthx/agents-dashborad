import { AlertTriangle, Users } from "lucide-react";

/**
 * Sección informativa (solo lectura) que explica al cliente cómo funciona
 * la transferencia automática al equipo humano (BloqueHandoff).
 */
export function HandoffInfoCard() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-sm font-semibold text-ink">Transferencia al equipo humano</h2>
        <p className="mt-0.5 text-sm text-ink-3">
          El agente puede transferir automáticamente la conversación a tu equipo en situaciones
          específicas. Esta lógica es gestionada por el sistema.
        </p>
      </div>

      <div className="rounded-lg border border-edge bg-surface-raised divide-y divide-edge">
        {/* Cuándo se transfiere */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Cuándo se activa
          </p>
          <ul className="space-y-1.5">
            {[
              "El cliente exige hablar con una persona.",
              "El agente no puede resolver la solicitud con la información disponible.",
              "Se detecta frustración o agresividad en el cliente.",
              "El caso requiere revisión o aprobación del equipo.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-4" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Tipos de urgencia */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Tipos de transferencia
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-xs font-semibold text-destructive">Urgente</p>
                <p className="mt-0.5 text-xs text-ink-2">
                  El agente responde:{" "}
                  <span className="italic">
                    "Te comunico ahora con alguien del equipo."
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-ink-4">
                  Se usa cuando el cliente está frustrado, agresivo o exige atención inmediata.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-edge bg-surface px-3 py-2.5">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
              <div>
                <p className="text-xs font-semibold text-ink-2">Normal</p>
                <p className="mt-0.5 text-xs text-ink-2">
                  El agente responde:{" "}
                  <span className="italic">
                    "Eso lo tiene que revisar el equipo. Te paso con ellos."
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-ink-4">
                  Se usa cuando el caso necesita revisión pero no hay urgencia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota del sistema */}
        <div className="px-4 py-3">
          <p className="text-[11px] text-ink-4">
            La transferencia es gestionada automáticamente por el sistema. No es necesario
            configurarla en el prompt.
          </p>
        </div>
      </div>
    </div>
  );
}
