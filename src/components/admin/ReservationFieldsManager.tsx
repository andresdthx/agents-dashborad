"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Check, X, Trash2, CalendarDays, GripVertical } from "lucide-react";
import { saveReservationConfig, type ReservationConfigInput } from "@/lib/actions/reservationConfig";
import type { ReservationOutputField } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Default fields matching DEFAULT_RESERVATION_FIELDS in the backend (llm.ts).
// Displayed when the client has no custom config yet.
const DEFAULT_FIELDS: ReservationOutputField[] = [
  { key: "nombre_lead",         label: "Nombre del cliente",  required: true,  hint: "Nombre completo del cliente" },
  { key: "servicio",            label: "Servicio",            required: true,  hint: "Nombre exacto del servicio reservado" },
  { key: "modalidad",           label: "Modalidad",           required: true,  hint: '"sede" o "domicilio"' },
  { key: "direccion_domicilio", label: "Dirección domicilio", required: false, hint: "Dirección completa si modalidad es domicilio, null si es sede" },
  { key: "personas",            label: "Personas",            required: false, hint: "Número de personas que recibirán el servicio, null si no se especificó" },
  { key: "fecha",               label: "Fecha",               required: true,  hint: "Formato YYYY-MM-DD (ej: 2026-03-15)" },
  { key: "hora",                label: "Hora",                required: true,  hint: 'Formato HH:MMam/pm o HH:MM 24h (ej: "10:00am" o "14:00")' },
  { key: "add_ons",             label: "Complementos",        required: false, hint: "Array de complementos o servicios adicionales seleccionados, [] si ninguno" },
  { key: "precio_servicio",     label: "Precio servicio",     required: false, hint: "Precio base del servicio en número, null si no se mencionó" },
  { key: "recargo_domicilio",   label: "Recargo domicilio",   required: false, hint: "Recargo adicional por domicilio en número, null si no aplica" },
  { key: "precio_total",        label: "Precio total",        required: false, hint: "Precio total incluyendo recargos en número, null si no se mencionó" },
  { key: "email",               label: "Correo electrónico",  required: false, hint: "Correo electrónico del cliente, null si no lo mencionó" },
];

interface Props {
  clientId: string;
  initialConfig: ReservationConfigInput | null;
}

interface EditState {
  label: string;
  hint: string;
}

interface NewFieldState {
  key: string;
  label: string;
  hint: string;
  required: boolean;
}

export function ReservationFieldsManager({ clientId, initialConfig }: Props) {
  // When no config exists, start with the defaults (empty output_fields = use defaults in backend).
  // We display defaults in the UI, but save them explicitly only when the user makes a change.
  const [blockEnabled, setBlockEnabled] = useState<boolean>(
    initialConfig?.block_enabled ?? true
  );
  const [fields, setFields] = useState<ReservationOutputField[]>(
    initialConfig?.output_fields?.length
      ? initialConfig.output_fields
      : DEFAULT_FIELDS
  );

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ label: "", hint: "" });
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newField, setNewField] = useState<NewFieldState>({ key: "", label: "", hint: "", required: false });
  const [savingNew, setSavingNew] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const persist = useCallback(async (
    nextFields: ReservationOutputField[],
    nextEnabled: boolean
  ) => {
    setSaving(true);
    const { error } = await saveReservationConfig(clientId, {
      output_fields: nextFields,
      block_enabled: nextEnabled,
    });
    setSaving(false);
    if (error) {
      toast.error("Error al guardar la configuración");
      return false;
    }
    return true;
  }, [clientId]);

  // ── Toggle block enabled ───────────────────────────────────────────────────

  const handleToggleBlock = useCallback(async () => {
    const next = !blockEnabled;
    const previous = blockEnabled;
    setBlockEnabled(next);
    const ok = await persist(fields, next);
    if (!ok) setBlockEnabled(previous);
    else toast.success(next ? "Bloque de reserva activado" : "Bloque de reserva desactivado");
  }, [blockEnabled, fields, persist]);

  // ── Toggle required ────────────────────────────────────────────────────────

  const handleToggleRequired = useCallback(async (field: ReservationOutputField) => {
    setTogglingKey(field.key);
    const previous = fields;
    const next = fields.map((f) =>
      f.key === field.key ? { ...f, required: !f.required } : f
    );
    setFields(next);
    const ok = await persist(next, blockEnabled);
    if (!ok) setFields(previous);
    else toast.success(`Campo "${field.label}" ${!field.required ? "marcado como requerido" : "marcado como opcional"}`);
    setTogglingKey(null);
  }, [fields, blockEnabled, persist]);

  // ── Edit label / hint ──────────────────────────────────────────────────────

  const startEdit = useCallback((field: ReservationOutputField) => {
    setEditingKey(field.key);
    setEditState({ label: field.label, hint: field.hint });
    setConfirmDeleteKey(null);
  }, []);

  const cancelEdit = useCallback(() => setEditingKey(null), []);

  const saveEdit = useCallback(async (field: ReservationOutputField) => {
    if (!editState.label.trim()) {
      toast.error("La etiqueta no puede estar vacía");
      return;
    }
    const previous = fields;
    const next = fields.map((f) =>
      f.key === field.key
        ? { ...f, label: editState.label.trim(), hint: editState.hint.trim() }
        : f
    );
    setFields(next);
    setEditingKey(null);
    const ok = await persist(next, blockEnabled);
    if (!ok) { setFields(previous); setEditingKey(field.key); }
    else toast.success("Campo actualizado");
  }, [editState, fields, blockEnabled, persist]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (key: string) => {
    setDeletingKey(key);
    setConfirmDeleteKey(null);
    const previous = fields;
    const next = fields.filter((f) => f.key !== key);
    setFields(next);
    const ok = await persist(next, blockEnabled);
    if (!ok) setFields(previous);
    else toast.success("Campo eliminado");
    setDeletingKey(null);
  }, [fields, blockEnabled, persist]);

  // ── Add custom field ───────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    const keyClean = newField.key.trim().replace(/\s+/g, "_").toLowerCase();
    if (!keyClean || !newField.label.trim()) {
      toast.error("La clave y la etiqueta son obligatorias");
      return;
    }
    if (fields.some((f) => f.key === keyClean)) {
      toast.error("Ya existe un campo con esa clave");
      return;
    }
    setSavingNew(true);
    const created: ReservationOutputField = {
      key: keyClean,
      label: newField.label.trim(),
      hint: newField.hint.trim(),
      required: newField.required,
    };
    const next = [...fields, created];
    setFields(next);
    const ok = await persist(next, blockEnabled);
    if (!ok) {
      setFields(fields);
    } else {
      setNewField({ key: "", label: "", hint: "", required: false });
      setShowNewForm(false);
      toast.success("Campo añadido");
    }
    setSavingNew(false);
  }, [newField, fields, blockEnabled, persist]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-5">
      {/* Global toggle */}
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
          disabled={saving}
          aria-label={blockEnabled ? "Desactivar bloque de reserva" : "Activar bloque de reserva"}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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

      {/* Fields list */}
      <div className={cn("space-y-3", !blockEnabled && "pointer-events-none opacity-50")}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-4">
            Campos del bloque · {fields.length} configurados
          </p>
          {!showNewForm && (
            <Button size="sm" onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4" />
              Añadir campo
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {fields.map((field) => {
            const isEditing = editingKey === field.key;
            const isConfirmingDelete = confirmDeleteKey === field.key;

            return (
              <div
                key={field.key}
                className="rounded-xl border border-edge bg-surface-raised"
              >
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="rounded bg-canvas px-1.5 py-0.5 text-xs font-mono text-ink-3">
                        {field.key}
                      </code>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`label-${field.key}`}>Etiqueta</Label>
                      <Input
                        id={`label-${field.key}`}
                        value={editState.label}
                        onChange={(e) => setEditState((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="Ej: Nombre del cliente"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`hint-${field.key}`}>
                        Instrucción para el agente{" "}
                        <span className="text-ink-4 font-normal">(opcional)</span>
                      </Label>
                      <Textarea
                        id={`hint-${field.key}`}
                        value={editState.hint}
                        onChange={(e) => setEditState((prev) => ({ ...prev, hint: e.target.value }))}
                        rows={2}
                        placeholder="Ej: Nombre completo del cliente"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(field)}>
                        <Check className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="h-4 w-4 shrink-0 text-ink-4" aria-hidden="true" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink leading-snug">{field.label}</p>
                        <code className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-mono text-ink-3 shrink-0">
                          {field.key}
                        </code>
                      </div>
                      {field.hint && (
                        <p className="mt-0.5 text-xs text-ink-4 truncate">{field.hint}</p>
                      )}
                    </div>

                    {/* Required toggle */}
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleRequired(field)}
                          disabled={togglingKey === field.key}
                          aria-label={field.required ? "Marcar como opcional" : "Marcar como requerido"}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                            field.required ? "bg-signal" : "bg-edge"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                              field.required ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span className="text-xs text-ink-4 w-16">
                          {field.required ? "Requerido" : "Opcional"}
                        </span>
                      </div>

                      <Button size="sm" variant="outline" onClick={() => startEdit(field)}>
                        Editar
                      </Button>

                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(field.key)}
                            disabled={deletingKey === field.key}
                          >
                            {deletingKey === field.key ? "..." : "Eliminar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteKey(null)}
                          >
                            <X className="h-4 w-4" />
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
                        </Button>
                      )}
                    </div>
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
                Añade campos para que el agente los capture al confirmar una reserva.
              </p>
            </div>
          )}
        </div>

        {/* New field form */}
        {showNewForm && (
          <div className="rounded-xl border border-edge bg-surface-raised p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Nuevo campo personalizado</p>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-key">Clave JSON</Label>
              <Input
                id="new-field-key"
                value={newField.key}
                onChange={(e) => setNewField((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="Ej: numero_personas"
                autoFocus
              />
              <p className="text-[11px] text-ink-4">
                Nombre de la propiedad en el JSON que emite el agente. Solo letras, números y guiones bajos.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-label">Etiqueta</Label>
              <Input
                id="new-field-label"
                value={newField.label}
                onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Ej: Número de personas"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-field-hint">
                Instrucción para el agente{" "}
                <span className="text-ink-4 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="new-field-hint"
                value={newField.hint}
                onChange={(e) => setNewField((prev) => ({ ...prev, hint: e.target.value }))}
                rows={2}
                placeholder="Ej: Número entero de personas que asistirán, null si no se mencionó"
              />
            </div>
            <RequiredToggle
              value={newField.required}
              onChange={(v) => setNewField((prev) => ({ ...prev, required: v }))}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={savingNew}>
                <Check className="h-4 w-4" />
                {savingNew ? "Añadiendo..." : "Añadir campo"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setNewField({ key: "", label: "", hint: "", required: false });
                }}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-ink-4">
        Los cambios se aplican en hasta 5 minutos (caché del servidor).
      </p>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function RequiredToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Tipo de campo</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            !value
              ? "border-signal/40 bg-signal/10 text-ink font-medium"
              : "border-edge bg-canvas text-ink-3 hover:border-edge-strong"
          )}
        >
          Opcional
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            value
              ? "border-signal/40 bg-signal/10 text-ink font-medium"
              : "border-edge bg-canvas text-ink-3 hover:border-edge-strong"
          )}
        >
          Requerido
        </button>
      </div>
      <p className="text-[11px] text-ink-4">
        {value
          ? "El agente debe capturar este campo siempre."
          : "El agente puede dejar este campo en null si el cliente no lo mencionó."}
      </p>
    </div>
  );
}
