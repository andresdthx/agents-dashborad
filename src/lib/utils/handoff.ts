export interface HandoffRule {
  id: string;
  trigger: string;
  urgent: boolean;
  /** Mensaje opcional que el agente envía al cliente antes de transferir. */
  response?: string;
}

const CLIENT_RULES_RE = /<ReglasCliente>([\s\S]*?)<\/ReglasCliente>/i;
// Formato: - [trigger] → urgente: true/false
//          - [trigger] → urgente: true/false; respuesta: [texto]
const RULE_LINE_RE = /^- (.+?) → urgente: (true|false)(?:; respuesta: (.+))?$/;

/**
 * Extrae las reglas del cliente desde el bloque <ReglasCliente> dentro de <BloqueHandoff>.
 * Retorna un array vacío si no existen reglas configuradas.
 */
export function parseHandoffRules(promptContent: string): HandoffRule[] {
  const match = promptContent.match(CLIENT_RULES_RE);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const m = line.match(RULE_LINE_RE);
      if (!m) return [];
      return [{
        id: crypto.randomUUID(),
        trigger: m[1],
        urgent: m[2] === "true",
        response: m[3] ?? undefined,
      }];
    });
}
