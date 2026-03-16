"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TableProperties, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { saveCatalogConfig, type CatalogConfigInput } from "@/lib/actions/catalogConfig";
import type { CatalogSystemKey, CatalogColMapping } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_COLS = 10;

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
  const [editingKey, setEditingKey] = useState<CatalogSystemKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<CatalogSystemKey | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addKey, setAddKey] = useState<CatalogSystemKey | "">("");
  const [addValue, setAddValue] = useState("");
  const [saving, setSaving] = useState(false);

  const activeKeys = ALL_KEYS.filter((k) => mapping[k] !== undefined && mapping[k] !== "");
  const availableKeys = ALL_KEYS.filter((k) => !activeKeys.includes(k));

  // ── Edit ──────────────────────────────────────────────────────────────────

  const startEdit = useCallback((key: CatalogSystemKey) => {
    setEditingKey(key);
    setEditValue(mapping[key] ?? "");
    setConfirmDeleteKey(null);
  }, [mapping]);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditValue("");
  }, []);

  const saveEdit = useCallback((key: CatalogSystemKey) => {
    if (!editValue.trim()) {
      toast.error("El nombre de columna no puede estar vacío");
      return;
    }
    setMapping((prev) => ({ ...prev, [key]: editValue.trim() }));
    setEditingKey(null);
    setEditValue("");
  }, [editValue]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback((key: CatalogSystemKey) => {
    setConfirmDeleteKey(null);
    setMapping((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Add ───────────────────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    if (!addKey || !addValue.trim()) {
      toast.error("Selecciona una columna e ingresa el nombre");
      return;
    }
    setMapping((prev) => ({ ...prev, [addKey]: addValue.trim() }));
    setAddKey("");
    setAddValue("");
    setShowAddForm(false);
  }, [addKey, addValue]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const clean: CatalogColMapping = {};
    for (const key of ALL_KEYS) {
      const val = mapping[key]?.trim();
      if (val) clean[key] = val;
    }

    if (Object.keys(clean).length === 0) {
      toast.error("Agrega al menos una columna antes de guardar");
      return;
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

    toast.success("Columnas del Sheet guardadas");
  }, [clientId, mapping]);

  if (!isGoogleSheet) {
    return (
      <div className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-edge bg-canvas py-14 text-center">
        <TableProperties className="h-8 w-8 text-ink-4" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-3">Sin Google Sheet configurado</p>
        <p className="text-xs text-ink-4">
          Este cliente no tiene un Google Sheet como fuente de catálogo.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Header info */}
      <div className="rounded-xl border border-edge bg-surface-raised shadow-sm px-4 py-3">
        <div className="flex items-start gap-3">
          <TableProperties className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-ink">Mapeo de columnas</p>
            <p className="text-xs text-ink-3 leading-relaxed">
              Indica el nombre exacto de cada columna en el Google Sheet, tal como aparece en los encabezados. Máximo {MAX_COLS} columnas.
            </p>
          </div>
          <span className="ml-auto shrink-0 rounded-full border border-edge px-2.5 py-0.5 text-[11px] font-medium text-ink-3 whitespace-nowrap tabular-nums">
            {activeKeys.length} / {MAX_COLS}
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-4">
            Columnas configuradas
          </p>
          {!showAddForm && availableKeys.length > 0 && activeKeys.length < MAX_COLS && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4" />
              Agregar columna
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {activeKeys.map((key) => {
            const meta = SYSTEM_KEY_META[key];
            const isEditing = editingKey === key;
            const isConfirmingDelete = confirmDeleteKey === key;

            return (
              <div key={key} className="rounded-xl border border-edge bg-surface-raised shadow-sm">
                {isEditing ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{meta.label}</p>
                      <p className="mt-0.5 text-xs text-ink-4">{meta.hint}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(key); if (e.key === "Escape") cancelEdit(); }}
                        className="h-8 w-44 text-sm font-mono"
                        autoFocus
                      />
                      <Button size="icon-sm" onClick={() => saveEdit(key)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink leading-snug">{meta.label}</p>
                      <p className="mt-0.5 text-xs text-ink-4">{meta.hint}</p>
                    </div>
                    <code className="shrink-0 rounded bg-canvas px-2 py-0.5 text-xs font-mono text-ink-2 border border-edge">
                      {mapping[key]}
                    </code>
                    <div className="flex shrink-0 items-center gap-1">
                      {isConfirmingDelete ? (
                        <>
                          <span className="text-xs text-ink-3 mr-1">¿Eliminar?</span>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(key)}>
                            Sí
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteKey(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(key)}>
                            <Pencil className="h-3.5 w-3.5 text-ink-3" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteKey(key)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {activeKeys.length === 0 && !showAddForm && (
            <div className="rounded-xl border border-dashed border-edge bg-canvas py-14 text-center">
              <TableProperties className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-ink-3">Sin columnas configuradas</p>
              <p className="mt-1 text-xs text-ink-4">Agrega las columnas que usa tu Google Sheet.</p>
            </div>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="rounded-xl border border-edge bg-surface-raised shadow-sm p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Agregar columna</p>
            <div className="space-y-1.5">
              <p className="text-xs text-ink-3">Campo del sistema</p>
              <select
                value={addKey}
                onChange={(e) => setAddKey(e.target.value as CatalogSystemKey)}
                className="w-full rounded-lg border border-edge bg-canvas px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal"
              >
                <option value="">Seleccionar campo...</option>
                {availableKeys.map((k) => (
                  <option key={k} value={k}>{SYSTEM_KEY_META[k].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-ink-3">Nombre de la columna en el Sheet</p>
              <Input
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                placeholder="ej: nombre_servicio"
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Check className="h-4 w-4" />
                Agregar
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAddForm(false); setAddKey(""); setAddValue(""); }}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-4">
          Los cambios se aplican en hasta 30 minutos (caché del servidor).
        </p>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
