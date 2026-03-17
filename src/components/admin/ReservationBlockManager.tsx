"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  CalendarDays,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { saveReservationConfig } from "@/lib/actions/reservationConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ReservationOutputField } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldState {
  key: string;
  label: string;
  hint: string;
  example?: string;
  required: boolean;
  enabled: boolean;
  isDefault: boolean;
}

interface Props {
  clientId: string;
  initialOutputFields: ReservationOutputField[];
  initialBlockEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildInitialFields(saved: ReservationOutputField[]): FieldState[] {
  return saved.map((f) => ({
    key: f.key,
    label: f.label ?? f.key,
    hint: f.hint ?? "",
    example: f.example,
    required: f.required ?? false,
    enabled: true,
    isDefault: false,
  }));
}

function toOutputFields(fields: FieldState[]): ReservationOutputField[] {
  return fields
    .filter((f) => f.enabled)
    .map(({ key, label, hint, example, required }) => ({
      key, label, hint, required,
      ...(example?.trim() ? { example: example.trim() } : {}),
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReservationBlockManager({
  clientId,
  initialOutputFields,
  initialBlockEnabled,
}: Props) {
  const [blockEnabled, setBlockEnabled] = useState(initialBlockEnabled);
  const [fields, setFields] = useState<FieldState[]>(() =>
    buildInitialFields(initialOutputFields)
  );
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editHint, setEditHint] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editExample, setEditExample] = useState("");
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newField, setNewField] = useState({ label: "", hint: "", example: "" });

  const pendingFieldsRef = useRef<FieldState[]>(fields);
  pendingFieldsRef.current = fields;

  // ── Persist ───────────────────────────────────────────────────────────────

  const persist = useCallback(async (
    nextFields: FieldState[],
    nextEnabled: boolean,
  ) => {
    const { error } = await saveReservationConfig(clientId, {
      output_fields: toOutputFields(nextFields),
      block_enabled: nextEnabled,
    });
    return error;
  }, [clientId]);

  // ── Toggle block ──────────────────────────────────────────────────────────

  const handleToggleBlock = useCallback(async () => {
    const next = !blockEnabled;
    setBlockEnabled(next);
    const error = await persist(pendingFieldsRef.current, next);
    if (error) {
      setBlockEnabled(!next);
      toast.error("Error al cambiar el estado del bloque");
    } else {
      toast.success(next ? "Bloque de reserva activado" : "Bloque de reserva desactivado");
    }
  }, [blockEnabled, persist]);

  // ── Toggle field ──────────────────────────────────────────────────────────

  const handleToggleField = useCallback(async (key: string) => {
    setTogglingKey(key);
    const previous = pendingFieldsRef.current;
    const next = previous.map((f) =>
      f.key === key ? { ...f, enabled: !f.enabled } : f
    );
    setFields(next);
    const error = await persist(next, blockEnabled);
    setTogglingKey(null);
    if (error) {
      setFields(previous);
      toast.error("Error al cambiar el campo");
    } else {
      const toggled = next.find((f) => f.key === key);
      toast.success(toggled?.enabled ? "Campo activado" : "Campo desactivado");
    }
  }, [blockEnabled, persist]);

  // ── Expand / edit ─────────────────────────────────────────────────────────

  const toggleExpand = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
    if (editingKey === key) setEditingKey(null);
    setConfirmDeleteKey(null);
  }, [editingKey]);

  const startEdit = useCallback((field: FieldState) => {
    setEditingKey(field.key);
    setEditHint(field.hint);
    setEditLabel(field.label);
    setEditExample(field.example ?? "");
    setExpandedKey(field.key);
    setConfirmDeleteKey(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditHint("");
    setEditLabel("");
    setEditExample("");
  }, []);

  const saveEdit = useCallback(async (field: FieldState) => {
    if (!editHint.trim()) {
      toast.error("El hint es obligatorio");
      return;
    }
    setSavingKey(field.key);
    const previous = pendingFieldsRef.current;
    const next = previous.map((f) =>
      f.key === field.key
        ? {
            ...f,
            hint: editHint.trim().toUpperCase(),
            example: editExample.trim() || undefined,
            label: field.isDefault ? f.label : (editLabel.trim() || f.label),
          }
        : f
    );
    setFields(next);
    setEditingKey(null);
    const error = await persist(next, blockEnabled);
    setSavingKey(null);
    if (error) {
      setFields(previous);
      setEditingKey(field.key);
      toast.error("Error al guardar los cambios");
    } else {
      toast.success("Campo actualizado");
    }
  }, [editHint, editLabel, editExample, blockEnabled, persist]);

  // ── Delete (custom fields only) ───────────────────────────────────────────

  const handleDelete = useCallback(async (key: string) => {
    setConfirmDeleteKey(null);
    const previous = pendingFieldsRef.current;
    const next = previous.filter((f) => f.key !== key);
    setFields(next);
    setExpandedKey(null);
    const error = await persist(next, blockEnabled);
    if (error) {
      setFields(previous);
      toast.error("Error al eliminar el campo");
    } else {
      toast.success("Campo eliminado");
    }
  }, [blockEnabled, persist]);

  // ── Add custom field ──────────────────────────────────────────────────────

  const handleAddField = useCallback(async () => {
    if (!newField.label.trim() || !newField.hint.trim()) {
      toast.error("El nombre y el hint son obligatorios");
      return;
    }
    const slugLabel = newField.label
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    const key = slugLabel || `campo_${Date.now()}`;
    if (pendingFieldsRef.current.some((f) => f.key === key)) {
      toast.error("Ya existe un campo con ese nombre. Cambia el nombre.");
      return;
    }
    const created: FieldState = {
      key,
      label: newField.label.trim(),
      hint: newField.hint.trim().toUpperCase(),
      example: newField.example.trim() || undefined,
      required: false,
      enabled: true,
      isDefault: false,
    };
    const next = [...pendingFieldsRef.current, created];
    setFields(next);
    setNewField({ label: "", hint: "", example: "" });
    setShowNewForm(false);
    setExpandedKey(key);
    const error = await persist(next, blockEnabled);
    if (error) {
      setFields(pendingFieldsRef.current.filter((f) => f.key !== key));
      toast.error("Error al crear el campo");
    } else {
      toast.success("Campo creado");
    }
  }, [newField, blockEnabled, persist]);

  const CUSTOM_FIELD_LIMIT = 5;
  const customFields = fields.filter((f) => !f.isDefault);
  const activeCount = fields.filter((f) => f.enabled).length;
  const atLimit = customFields.length >= CUSTOM_FIELD_LIMIT;

  return (
    <div className="w-full space-y-5">

      {/* ── Block enable toggle ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-edge bg-surface-raised shadow-sm px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Bloque de reserva</p>
          <p className="mt-0.5 text-xs text-ink-4">
            Cuando está activo, el agente emite el bloque RESERVA_INICIO/FIN al confirmar una cita.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleBlock}
          aria-label={blockEnabled ? "Desactivar bloque de reserva" : "Activar bloque de reserva"}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            blockEnabled ? "bg-signal" : "bg-edge"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
              blockEnabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* ── Fields ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fields.length > 0 && (
              <>
                <span className="text-sm text-ink-3">
                  {activeCount} activo{activeCount !== 1 ? "s" : ""}
                </span>
                <span className="text-ink-4">·</span>
                <span className="text-sm text-ink-4">{fields.length} total</span>
              </>
            )}
          </div>
          {!showNewForm && (
            atLimit ? (
              <span className="text-xs text-ink-3">
                Límite alcanzado ({CUSTOM_FIELD_LIMIT}/{CUSTOM_FIELD_LIMIT}) —{" "}
                <span className="text-signal font-medium">compra más campos</span>
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowNewForm(true)}
                aria-label="Agregar nuevo campo"
              >
                <Plus className="h-4 w-4" />
                Nuevo campo {customFields.length > 0 && `(${customFields.length}/${CUSTOM_FIELD_LIMIT})`}
              </Button>
            )
          )}
        </div>

        {/* Formulario nuevo campo — aparece arriba de la lista */}
        {showNewForm && (
          <div className="rounded-xl border border-edge bg-surface-raised shadow-sm p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Nuevo campo</p>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-label">Nombre del dato</Label>
              <Input
                id="new-field-label"
                value={newField.label}
                onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="ej: Número de teléfono"
                maxLength={30}
                autoFocus
              />
              <p className="text-[11px] text-ink-4">Máx. 30 caracteres. Se guarda tal como lo escribes.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-hint">¿Cómo lo pide el agente?</Label>
              <Input
                id="new-field-hint"
                value={newField.hint}
                onChange={(e) => setNewField((prev) => ({ ...prev, hint: e.target.value.toUpperCase() }))}
                placeholder="ej: TELÉFONO"
                maxLength={30}
              />
              <p className="text-[11px] text-ink-4">Máx. 30 caracteres. Se guarda en mayúsculas.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-example">
                Ejemplo <span className="text-ink-4 font-normal">(opcional)</span>
              </Label>
              <Input
                id="new-field-example"
                value={newField.example}
                onChange={(e) => setNewField((prev) => ({ ...prev, example: e.target.value }))}
                placeholder="ej: +57 300 123 4567"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddField}>
                <Check className="h-4 w-4" />
                Crear campo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowNewForm(false); setNewField({ label: "", hint: "", example: "" }); }}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="space-y-2">
          {fields.map((field) => {
            const isExpanded = expandedKey === field.key;
            const isEditing = editingKey === field.key;
            const isConfirmingDelete = confirmDeleteKey === field.key;

            return (
              <div
                key={field.key}
                className={cn(
                  "rounded-xl border border-edge bg-surface-raised shadow-sm transition-opacity",
                  !field.enabled && "opacity-55"
                )}
              >
                {/* Fila cabecera */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => toggleExpand(field.key)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-ink leading-snug">
                        {field.label}
                      </span>
                      {!field.enabled && (
                        <span className="shrink-0 rounded-full bg-lead-cold-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lead-cold-text">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Controles */}
                  <div className="flex shrink-0 items-center gap-2">
                    {!field.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleToggleField(field.key)}
                        disabled={togglingKey === field.key}
                        aria-label={field.enabled ? "Desactivar campo" : "Activar campo"}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                          field.enabled ? "bg-signal" : "bg-edge"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                            field.enabled ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleExpand(field.key)}
                      aria-label={isExpanded ? "Colapsar" : "Expandir"}
                    >
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-ink-4" />
                        : <ChevronDown className="h-4 w-4 text-ink-4" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Panel expandido */}
                {isExpanded && (
                  <div className="border-t border-edge px-4 pb-4 pt-3 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* Label — solo editable en campos custom */}
                        {!field.isDefault && (
                          <div className="space-y-1.5">
                            <Label htmlFor={`label-${field.key}`}>Nombre del dato</Label>
                            <Input
                              id={`label-${field.key}`}
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="ej: Número de teléfono"
                              maxLength={30}
                            />
                            <p className="text-[11px] text-ink-4">Máx. 30 caracteres.</p>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label htmlFor={`hint-${field.key}`}>¿Cómo lo pide el agente?</Label>
                          <Input
                            id={`hint-${field.key}`}
                            value={editHint}
                            onChange={(e) => setEditHint(e.target.value.toUpperCase())}
                            placeholder="ej: TELÉFONO"
                            maxLength={30}
                          />
                          <p className="text-[11px] text-ink-4">Máx. 30 caracteres. Se guarda en mayúsculas.</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`example-${field.key}`}>
                            Ejemplo <span className="text-ink-4 font-normal">(opcional)</span>
                          </Label>
                          <Input
                            id={`example-${field.key}`}
                            value={editExample}
                            onChange={(e) => setEditExample(e.target.value)}
                            placeholder="ej: YYYY-MM-DD"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(field)} disabled={savingKey === field.key}>
                            <Check className="h-4 w-4" />
                            {savingKey === field.key ? "Guardando..." : "Guardar"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-canvas rounded-lg px-3 py-2 space-y-0.5">
                          <p className="text-xs text-ink-3">
                            <span className="text-ink-4">Hint: </span>{field.hint}
                          </p>
                          {field.example && (
                            <p className="text-xs text-ink-4">
                              <span>Ejemplo: </span>{field.example}
                            </p>
                          )}
                        </div>
                        {!field.isDefault && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(field)}>
                              Editar
                            </Button>
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-ink-3">¿Eliminar definitivamente?</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(field.key)}
                                >
                                  Sí, eliminar
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteKey(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDeleteKey(field.key)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {fields.length === 0 && !showNewForm && (
            <div className="rounded-xl border border-dashed border-edge bg-canvas py-14 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-ink-3">Sin campos configurados</p>
              <p className="mt-1 text-xs text-ink-4">
                Agrega los datos que el agente debe capturar al confirmar una reserva.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// ── Icon export for page ────────────────────────────────────────────────────
export { CalendarCheck };
