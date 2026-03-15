"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TableProperties } from "lucide-react";
import { saveCatalogConfig, type CatalogConfigInput } from "@/lib/actions/catalogConfig";
import type { CatalogSystemKey, CatalogColMapping } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_COLS = 10;

// Metadatos de las claves del sistema que reconoce el backend (catalogSearch.ts)
const SYSTEM_KEY_META: Record<CatalogSystemKey, { label: string; hint: string }> = {
  name:            { label: "Nombre del servicio/producto", hint: "Columna con el nombre del ítem" },
  price:           { label: "Precio general",               hint: "Precio único (sin distinción sede/domicilio)" },
  price_sede:      { label: "Precio en sede",               hint: "Precio en el local o sede física" },
  price_domicilio: { label: "Precio a domicilio",           hint: "Precio cuando el servicio es a domicilio" },
  available:       { label: "Disponibilidad",               hint: 'Columna con "si"/"no" o "disponible"/"agotado"' },
  description:     { label: "Descripción",                  hint: "Columna con la descripción del ítem" },
  notes:           { label: "Notas",                        hint: "Columna de notas o información adicional" },
};

const ALL_KEYS = Object.keys(SYSTEM_KEY_META) as CatalogSystemKey[];

// Default: los nombres que usa el backend como fallback cuando no hay col_mapping
const DEFAULT_MAPPING: CatalogColMapping = {
  name:            "servicio",
  price_sede:      "precio_sede",
  price_domicilio: "precio_domicilio",
  available:       "disponible",
  description:     "descripcion",
  notes:           "notas",
};

interface Props {
  clientId: string;
  initialConfig: CatalogConfigInput | null;
  isGoogleSheet: boolean;
}

export function CatalogColMappingManager({ clientId, initialConfig, isGoogleSheet }: Props) {
  const [mapping, setMapping] = useState<CatalogColMapping>(
    initialConfig?.col_mapping && Object.keys(initialConfig.col_mapping).length > 0
      ? initialConfig.col_mapping
      : DEFAULT_MAPPING
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const activeCount = Object.values(mapping).filter((v) => v !== undefined && v !== "").length;

  const handleChange = useCallback((key: CatalogSystemKey, value: string) => {
    setMapping((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    // Limpiar entradas vacías antes de guardar
    const clean: CatalogColMapping = {};
    for (const key of ALL_KEYS) {
      const val = mapping[key]?.trim();
      if (val) clean[key] = val;
    }

    if (Object.keys(clean).length > MAX_COLS) {
      toast.error(`Máximo ${MAX_COLS} columnas permitidas`);
      return;
    }

    setSaving(true);
    const { error } = await saveCatalogConfig(clientId, { col_mapping: clean });
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    setMapping(clean);
    setDirty(false);
    toast.success("Columnas del Sheet guardadas");
  }, [clientId, mapping]);

  if (!isGoogleSheet) {
    return (
      <div className="flex max-w-2xl flex-col items-center gap-2 rounded-xl border border-dashed border-edge bg-canvas py-14 text-center">
        <TableProperties className="h-8 w-8 text-ink-4" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-3">Sin Google Sheet configurado</p>
        <p className="text-xs text-ink-4">
          Este cliente no tiene un Google Sheet como fuente de catálogo. Configura la URL del Sheet
          en la pestaña Configuración general.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header info */}
      <div className="rounded-xl border border-edge bg-surface-raised px-4 py-3">
        <div className="flex items-start gap-3">
          <TableProperties className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-ink">Mapeo de columnas</p>
            <p className="text-xs text-ink-3 leading-relaxed">
              Indica el nombre exacto de cada columna en el Google Sheet, tal como aparece en la
              fila de encabezados (respetando mayúsculas y tildes). Máximo {MAX_COLS} columnas.
            </p>
          </div>
          <span className="ml-auto shrink-0 rounded-full border border-edge px-2.5 py-0.5 text-[11px] font-medium text-ink-3 whitespace-nowrap tabular-nums">
            {activeCount} / {MAX_COLS}
          </span>
        </div>
      </div>

      {/* Column rows */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-4">
          Columnas del sistema
        </p>

        <div className="divide-y divide-edge rounded-xl border border-edge bg-surface-raised">
          {ALL_KEYS.map((key) => {
            const meta = SYSTEM_KEY_META[key];
            return (
              <div key={key} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink leading-snug">{meta.label}</p>
                  <p className="mt-0.5 text-xs text-ink-4 truncate">{meta.hint}</p>
                </div>
                <div className="shrink-0 w-48">
                  <Input
                    value={mapping[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="Nombre de columna..."
                    className="h-8 text-sm font-mono"
                    aria-label={`Columna del Sheet para ${meta.label}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-4">
          Los cambios se aplican en hasta 30 minutos (caché del servidor).
        </p>
        <Button onClick={handleSave} disabled={saving || !dirty} size="sm">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
