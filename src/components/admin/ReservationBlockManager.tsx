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
// Default fields — mirrors DEFAULT_RESERVATION_FIELDS in the Edge Function.
// ---------------------------------------------------------------------------
const DEFAULT_FIELDS: ReservationOutputField[] = [
  { key: "nombre_lead",         label: "Nombre del cliente",   required: true,  hint: "Nombre completo del cliente" },
  { key: "servicio",            label: "Servicio",             required: true,  hint: "Nombre exacto del servicio reservado" },
  { key: "modalidad",           label: "Modalidad",            required: true,  hint: '"sede" o "domicilio"' },
  { key: "direccion_domicilio", label: "Dirección domicilio",  required: false, hint: "Dirección completa si modalidad es domicilio, null si es sede" },
  { key: "personas",            label: "Personas",             required: false, hint: "Número de personas que recibirán el servicio, null si no se especificó" },
  { key: "fecha",               label: "Fecha",                required: true,  hint: "Formato YYYY-MM-DD (ej: 2026-03-15)" },
  { key: "hora",                label: "Hora",                 required: true,  hint: 'Formato HH:MMam/pm o HH:MM 24h (ej: "10:00am" o "14:00")' },
  { key: "add_ons",             label: "Complementos",         required: false, hint: "Array de complementos o servicios adicionales seleccionados, [] si ninguno" },
  { key: "precio_servicio",     label: "Precio servicio",      required: false, hint: "Precio base del servicio en número, null si no se mencionó" },
  { key: "recargo_domicilio",   label: "Recargo domicilio",    required: false, hint: "Recargo adicional por domicilio en número, null si no aplica" },
  { key: "precio_total",        label: "Precio total",         required: false, hint: "Precio total incluyendo recargos en número, null si no se mencionó" },
  { key: "email",               label: "Correo electrónico",   required: false, hint: "Correo electrónico del cliente, null si no lo mencionó" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldState {
  key: string;
  label: string;
  hint: string;
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
  const savedKeys = new Set(saved.map((f) => f.key));
  const savedByKey = new Map(saved.map((f) => [f.key, f]));

  const result: FieldState[] = DEFAULT_FIELDS.map((def) => {
    const savedField = savedByKey.get(def.key);
    return {
      key: def.key,
      label: def.label,
      hint: savedField?.hint ?? def.hint,
      enabled: saved.length === 0 ? def.required : savedKeys.has(def.key),
      isDefault: true,
    };
  });

  for (const f of saved) {
    if (!DEFAULT_FIELDS.some((d) => d.key === f.key)) {
      result.push({
        key: f.key,
        label: f.label ?? f.key,
        hint: f.hint ?? "",
        enabled: true,
        isDefault: false,
      });
    }
  }

  return result;
}

function toOutputFields(fields: FieldState[]): ReservationOutputField[] {
  return fields
    .filter((f) => f.enabled)
    .map(({ key, label, hint }) => ({ key, label, hint, required: true }));
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
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newField, setNewField] = useState({ label: "", hint: "" });

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
    setExpandedKey(field.key);
    setConfirmDeleteKey(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditHint("");
    setEditLabel("");
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
        ? { ...f, hint: editHint.trim(), label: field.isDefault ? f.label : (editLabel.trim() || f.key) }
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
  }, [editHint, editLabel, blockEnabled, persist]);

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
    const key = `campo_${Date.now()}`;
    const created: FieldState = {
      key,
      label: newField.label.trim(),
      hint: newField.hint.trim(),
      enabled: true,
      isDefault: false,
    };
    const next = [...pendingFieldsRef.current, created];
    setFields(next);
    setNewField({ label: "", hint: "" });
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

  const activeCount = fields.filter((f) => f.enabled).length;

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Block enable toggle ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-edge bg-surface-raised px-4 py-3">
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
            <Button
              size="sm"
              onClick={() => setShowNewForm(true)}
              aria-label="Agregar nuevo campo"
            >
              <Plus className="h-4 w-4" />
              Nuevo campo
            </Button>
          )}
        </div>

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
                  "rounded-xl border border-edge bg-surface-raised transition-opacity",
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
                            />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label htmlFor={`hint-${field.key}`}>
                            ¿Cómo debe pedirlo o entenderlo el agente?
                          </Label>
                          <Input
                            id={`hint-${field.key}`}
                            value={editHint}
                            onChange={(e) => setEditHint(e.target.value)}
                            placeholder="ej: Formato YYYY-MM-DD (día, mes, año)"
                          />
                          <p className="text-[11px] text-ink-4">
                            Esta instrucción le indica al agente qué formato o aclaración aplicar al capturar este dato.
                          </p>
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
                        <p className="text-xs text-ink-3 bg-canvas rounded-lg px-3 py-2">
                          {field.hint}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(field)}>
                            Editar
                          </Button>
                          {!field.isDefault && (
                            isConfirmingDelete ? (
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
                            )
                          )}
                        </div>
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

        {/* Formulario nuevo campo */}
        {showNewForm && (
          <div className="rounded-xl border border-edge bg-surface-raised p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Nuevo campo</p>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-label">Nombre del dato</Label>
              <Input
                id="new-field-label"
                value={newField.label}
                onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="ej: Número de teléfono"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-hint">¿Cómo debe pedirlo o entenderlo el agente?</Label>
              <Input
                id="new-field-hint"
                value={newField.hint}
                onChange={(e) => setNewField((prev) => ({ ...prev, hint: e.target.value }))}
                placeholder="ej: Número con código de país, ej: +57 300 123 4567"
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
                onClick={() => { setShowNewForm(false); setNewField({ label: "", hint: "" }); }}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ── Icon export for page ────────────────────────────────────────────────────
export { CalendarCheck };
