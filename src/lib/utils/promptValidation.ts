/**
 * Validación de tokens reservados del sistema en el prompt del agente.
 *
 * Estos tokens son emitidos o parseados por la Edge Function en tiempo real.
 * Si el usuario los hardcodea en el prompt, el parser los detecta como eventos
 * reales (handoffs, pedidos, reservas) en cada respuesta del LLM.
 *
 * La validación es intencionalmente case-SENSITIVE: solo el casing exacto
 * representa un riesgo. Palabras como "handoff", "Handoff" o "pedido" en
 * texto libre son completamente válidas e inofensivas.
 */

export interface ForbiddenPatternRule {
  pattern: RegExp;
  label: string;
  reason: string;
}

export const FORBIDDEN_PROMPT_PATTERNS: ForbiddenPatternRule[] = [
  // Tokens de comando del LLM para transferencias — parseados por parseHandoffData()
  {
    pattern: /HANDOFF_INICIO/,
    label: "HANDOFF_INICIO",
    reason:
      "Es una señal interna del sistema para transferir la conversación al equipo humano. El sistema la gestiona automáticamente según las reglas de handoff configuradas.",
  },
  {
    pattern: /HANDOFF_FIN/,
    label: "HANDOFF_FIN",
    reason:
      "Es una señal interna del sistema. No debe incluirse manualmente en el prompt.",
  },
  // Tokens de comando del LLM para pedidos — parseados por parseOrderData()
  {
    pattern: /PEDIDO_INICIO/,
    label: "PEDIDO_INICIO",
    reason:
      "Es una señal interna del sistema para registrar pedidos confirmados. El sistema la gestiona automáticamente.",
  },
  {
    pattern: /PEDIDO_FIN/,
    label: "PEDIDO_FIN",
    reason:
      "Es una señal interna del sistema. No debe incluirse manualmente en el prompt.",
  },
  // Tokens de comando del LLM para reservas — parseados por parseReservationData()
  // (También eliminados por stripSystemBlocks, pero se bloquean aquí para dar feedback claro)
  {
    pattern: /RESERVA_INICIO/,
    label: "RESERVA_INICIO",
    reason:
      "Es una señal interna del sistema para registrar reservas. El sistema la inyecta automáticamente según tu configuración de reservas.",
  },
  {
    pattern: /RESERVA_FIN/,
    label: "RESERVA_FIN",
    reason:
      "Es una señal interna del sistema. No debe incluirse manualmente en el prompt.",
  },
];

export interface PromptValidationResult {
  valid: boolean;
  error: string | null;
  matchedLabel: string | null;
}

/**
 * Valida que el contenido del prompt no contenga tokens reservados del sistema.
 *
 * Debe ejecutarse DESPUÉS de stripSystemBlocks() para que los bloques XML
 * (<BloqueHandoff>, <BloqueReserva>) ya estén eliminados antes de la validación.
 */
export function validatePromptContent(content: string): PromptValidationResult {
  for (const rule of FORBIDDEN_PROMPT_PATTERNS) {
    if (rule.pattern.test(content)) {
      return {
        valid: false,
        error: `El prompt contiene la palabra reservada "${rule.label}". ${rule.reason}`,
        matchedLabel: rule.label,
      };
    }
  }
  return { valid: true, error: null, matchedLabel: null };
}
