"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Plus, Trash2, Users, X } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { createHandoff, updateHandoff, deleteHandoff, type ClientHandoff } from "@/lib/queries/handoffs";
import { regenerateHandoffBlock } from "@/lib/actions/handoffRules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  initialHandoffs: ClientHandoff[];
}

interface EditState {
  trigger: string;
  urgent: boolean;
  response: string;
}

export function HandoffRulesManager({ clientId, initialHandoffs }: Props) {
  const [handoffs, setHandoffs] = useState<ClientHandoff[]>(initialHandoffs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ trigger: "", urgent: false, response: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newHandoff, setNewHandoff] = useState<EditState>({ trigger: "", urgent: false, response: "" });
  const [savingNew, setSavingNew] = useState(false);

  const supabase = getBrowserClient();

  // ── Edición inline ──────────────────────────────────────────────────────────

  const startEdit = useCallback((h: ClientHandoff) => {
    setEditingId(h.id);
    setEditState({ trigger: h.trigger, urgent: h.urgent, response: h.response ?? "" });
    setConfirmDeleteId(null);
  }, []);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const saveEdit = useCallback(async (h: ClientHandoff) => {
    if (!editState.trigger.trim()) {
      toast.error("El disparador no puede estar vacío");
      return;
    }
    setSavingId(h.id);
    const previous = handoffs;
    const updated = handoffs.map((item) =>
      item.id === h.id
        ? { ...item, trigger: editState.trigger.trim(), urgent: editState.urgent, response: editState.response.trim() || null }
        : item
    );
    setHandoffs(updated);
    setEditingId(null);

    const { error } = await updateHandoff(supabase, h.id, {
      trigger: editState.trigger.trim(),
      urgent: editState.urgent,
      response: editState.response.trim() || null,
    });

    if (error) {
      setHandoffs(previous);
      setEditingId(h.id);
      toast.error("Error al guardar");
    } else {
      await regenerateHandoffBlock(clientId);
      toast.success("Regla actualizada");
    }
    setSavingId(null);
  }, [editState, handoffs, supabase, clientId]);

  // ── Eliminar ───────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    const previous = handoffs;
    setHandoffs((prev) => prev.filter((h) => h.id !== id));

    const { error } = await deleteHandoff(supabase, id);

    if (error) {
      setHandoffs(previous);
      toast.error("Error al eliminar");
    } else {
      await regenerateHandoffBlock(clientId);
      toast.success("Regla eliminada");
    }
    setDeletingId(null);
  }, [handoffs, supabase, clientId]);

  // ── Crear ──────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!newHandoff.trigger.trim()) {
      toast.error("Escribe el disparador de la transferencia");
      return;
    }
    setSavingNew(true);
    const nextOrder = handoffs.length > 0 ? Math.max(...handoffs.map((h) => h.sort_order)) + 1 : 0;

    const { handoff: created, error } = await createHandoff(supabase, {
      client_id: clientId,
      trigger: newHandoff.trigger.trim(),
      urgent: newHandoff.urgent,
      response: newHandoff.response.trim() || undefined,
      sort_order: nextOrder,
    });

    if (error || !created) {
      toast.error("Error al crear la regla");
    } else {
      setHandoffs((prev) => [...prev, created]);
      setNewHandoff({ trigger: "", urgent: false, response: "" });
      setShowNewForm(false);
      await regenerateHandoffBlock(clientId);
      toast.success("Regla creada");
    }
    setSavingNew(false);
  }, [newHandoff, handoffs, supabase, clientId]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-3">
          {handoffs.length === 0
            ? "Sin reglas configuradas"
            : `${handoffs.length} regla${handoffs.length !== 1 ? "s" : ""} configurada${handoffs.length !== 1 ? "s" : ""}`}
        </p>
        {!showNewForm && (
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4" />
            Nueva regla
          </Button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {handoffs.map((h) => {
          const isEditing = editingId === h.id;
          const isConfirmingDelete = confirmDeleteId === h.id;

          return (
            <div key={h.id} className="rounded-lg border border-edge bg-surface-raised">
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`trigger-${h.id}`}>Disparador</Label>
                    <Input
                      id={`trigger-${h.id}`}
                      value={editState.trigger}
                      onChange={(e) => setEditState((prev) => ({ ...prev, trigger: e.target.value }))}
                      placeholder="Ej: El cliente menciona un precio de la competencia"
                      autoFocus
                    />
                  </div>
                  <UrgencyToggle
                    value={editState.urgent}
                    onChange={(v) => setEditState((prev) => ({ ...prev, urgent: v }))}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`response-${h.id}`}>
                      Respuesta al cliente <span className="text-ink-4 font-normal">(opcional)</span>
                    </Label>
                    <Textarea
                      id={`response-${h.id}`}
                      value={editState.response}
                      onChange={(e) => setEditState((prev) => ({ ...prev, response: e.target.value }))}
                      rows={2}
                      placeholder="Ej: Entiendo, déjame conectarte con alguien del equipo ahora mismo."
                    />
                    <p className="text-[11px] text-ink-4">
                      Si se deja vacío, el agente usará el mensaje por defecto según la urgencia.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(h)} disabled={savingId === h.id}>
                      <Check className="h-4 w-4" />
                      {savingId === h.id ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4">
                  <UrgencyIcon urgent={h.urgent} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink leading-snug">{h.trigger}</p>
                    <p className={cn("mt-0.5 text-xs", h.urgent ? "text-destructive" : "text-ink-4")}>
                      {h.urgent ? "Urgente" : "Normal"}
                    </p>
                    {h.response && (
                      <p className="mt-1 text-xs text-ink-3 italic">"{h.response}"</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(h)}>
                      Editar
                    </Button>
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(h.id)}
                          disabled={deletingId === h.id}
                        >
                          {deletingId === h.id ? "..." : "Eliminar"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(h.id)}
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

        {handoffs.length === 0 && !showNewForm && (
          <div className="rounded-lg border border-dashed border-edge bg-canvas py-12 text-center">
            <p className="text-sm text-ink-3">Sin reglas de transferencia configuradas.</p>
            <p className="mt-1 text-xs text-ink-4">
              Agrega cuándo el agente debe transferir la conversación a tu equipo.
            </p>
          </div>
        )}
      </div>

      {/* Formulario nueva regla */}
      {showNewForm && (
        <div className="rounded-lg border border-edge bg-surface-raised p-4 space-y-3">
          <p className="text-sm font-medium text-ink">Nueva regla de transferencia</p>
          <div className="space-y-1.5">
            <Label htmlFor="new-trigger">Disparador</Label>
            <Input
              id="new-trigger"
              value={newHandoff.trigger}
              onChange={(e) => setNewHandoff((prev) => ({ ...prev, trigger: e.target.value }))}
              placeholder="Ej: El cliente pregunta por devoluciones o reembolsos"
              autoFocus
            />
            <p className="text-[11px] text-ink-4">
              Describe la situación en la que el agente debe transferir al equipo humano.
            </p>
          </div>
          <UrgencyToggle
            value={newHandoff.urgent}
            onChange={(v) => setNewHandoff((prev) => ({ ...prev, urgent: v }))}
          />
          <div className="space-y-1.5">
            <Label htmlFor="new-response">
              Respuesta al cliente <span className="text-ink-4 font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="new-response"
              value={newHandoff.response}
              onChange={(e) => setNewHandoff((prev) => ({ ...prev, response: e.target.value }))}
              rows={2}
              placeholder="Ej: Entiendo, déjame conectarte con alguien del equipo ahora mismo."
            />
            <p className="text-[11px] text-ink-4">
              Si se deja vacío, el agente usará el mensaje por defecto según la urgencia.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={savingNew}>
              <Check className="h-4 w-4" />
              {savingNew ? "Creando..." : "Crear regla"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowNewForm(false); setNewHandoff({ trigger: "", urgent: false, response: "" }); }}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function UrgencyIcon({ urgent }: { urgent: boolean }) {
  return urgent ? (
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
  ) : (
    <Users className="mt-0.5 h-4 w-4 shrink-0 text-ink-4" />
  );
}

function UrgencyToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>Tipo de transferencia</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            !value ? "border-signal bg-signal/10 text-ink font-medium" : "border-edge bg-canvas text-ink-3 hover:border-edge-strong"
          )}
        >
          <Users className="h-4 w-4" />
          Normal
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            value ? "border-destructive/40 bg-destructive/10 text-destructive font-medium" : "border-edge bg-canvas text-ink-3 hover:border-edge-strong"
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Urgente
        </button>
      </div>
      <p className="text-[11px] text-ink-4">
        {value ? '"Te comunico ahora con alguien del equipo."' : '"Eso lo tiene que revisar el equipo. Te paso con ellos."'}
      </p>
    </div>
  );
}
