"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, ChevronDown, ChevronUp, Trash2, Check, X, MessageSquare } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { createFaq, updateFaq, deleteFaq, toggleFaqActive } from "@/lib/queries/faqs";
import type { ClientFaq } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  initialFaqs: ClientFaq[];
}

interface EditState {
  question: string;
  answer: string;
}

export function ClientFaqsManager({ clientId, initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<ClientFaq[]>(initialFaqs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ question: "", answer: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [savingNew, setSavingNew] = useState(false);

  const supabase = getBrowserClient();

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const startEdit = useCallback((faq: ClientFaq) => {
    setEditingId(faq.id);
    setEditState({ question: faq.question, answer: faq.answer });
    setExpandedId(faq.id);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditState({ question: "", answer: "" });
  }, []);

  const saveEdit = useCallback(async (faq: ClientFaq) => {
    if (!editState.question.trim() || !editState.answer.trim()) {
      toast.error("La pregunta y la respuesta son obligatorias");
      return;
    }
    setSavingId(faq.id);
    const previous = faqs;
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === faq.id
          ? { ...f, question: editState.question.trim(), answer: editState.answer.trim() }
          : f
      )
    );
    setEditingId(null);
    const { error } = await updateFaq(supabase, faq.id, {
      question: editState.question.trim(),
      answer: editState.answer.trim(),
    });
    setSavingId(null);
    if (error) {
      setFaqs(previous);
      setEditingId(faq.id);
      toast.error("Error al guardar los cambios");
    } else {
      toast.success("Pregunta actualizada");
    }
  }, [editState, faqs, supabase]);

  const handleToggleActive = useCallback(async (faq: ClientFaq) => {
    setTogglingId(faq.id);
    const previous = faqs;
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f))
    );
    const { error } = await toggleFaqActive(supabase, faq.id, !faq.is_active);
    setTogglingId(null);
    if (error) {
      setFaqs(previous);
      toast.error("Error al cambiar el estado");
    } else {
      toast.success(faq.is_active ? "Pregunta desactivada" : "Pregunta activada");
    }
  }, [faqs, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    const previous = faqs;
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    const { error } = await deleteFaq(supabase, id);
    setDeletingId(null);
    if (error) {
      setFaqs(previous);
      toast.error("Error al eliminar la pregunta");
    } else {
      toast.success("Pregunta eliminada");
    }
  }, [faqs, supabase]);

  const handleCreateFaq = useCallback(async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("La pregunta y la respuesta son obligatorias");
      return;
    }
    setSavingNew(true);
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.sort_order)) + 1 : 0;
    const { faq: created, error } = await createFaq(supabase, {
      client_id: clientId,
      question: newFaq.question.trim(),
      answer: newFaq.answer.trim(),
      is_active: true,
      sort_order: nextOrder,
    });
    setSavingNew(false);
    if (error || !created) {
      toast.error("Error al crear la pregunta");
    } else {
      setFaqs((prev) => [...prev, created]);
      setNewFaq({ question: "", answer: "" });
      setShowNewForm(false);
      setExpandedId(created.id);
      toast.success("Pregunta creada");
    }
  }, [newFaq, faqs, supabase, clientId]);

  const activeCount = faqs.filter((f) => f.is_active).length;

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {faqs.length > 0 && (
            <>
              <span className="text-sm text-ink-3">
                {activeCount} activa{activeCount !== 1 ? "s" : ""}
              </span>
              <span className="text-ink-4">·</span>
              <span className="text-sm text-ink-4">{faqs.length} total</span>
            </>
          )}
        </div>
        {!showNewForm && (
          <Button
            size="sm"
            onClick={() => setShowNewForm(true)}
            aria-label="Agregar nueva pregunta frecuente"
          >
            <Plus className="h-4 w-4" />
            Nueva pregunta
          </Button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          const isEditing = editingId === faq.id;
          const isConfirmingDelete = confirmDeleteId === faq.id;

          return (
            <div
              key={faq.id}
              className={cn(
                "rounded-xl border border-edge bg-surface-raised transition-opacity",
                !faq.is_active && "opacity-55"
              )}
            >
              {/* Fila cabecera */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => toggleExpand(faq.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-ink leading-snug">
                      {faq.question}
                    </span>
                    {!faq.is_active && (
                      <span className="shrink-0 rounded-full bg-lead-cold-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lead-cold-text">
                        Inactiva
                      </span>
                    )}
                  </div>
                </button>

                {/* Controles */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    disabled={togglingId === faq.id}
                    aria-label={faq.is_active ? "Desactivar pregunta" : "Activar pregunta"}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      faq.is_active ? "bg-signal" : "bg-edge"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                        faq.is_active ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleExpand(faq.id)}
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
                      <div className="space-y-1.5">
                        <Label htmlFor={`q-${faq.id}`}>Pregunta</Label>
                        <Input
                          id={`q-${faq.id}`}
                          value={editState.question}
                          onChange={(e) => setEditState((prev) => ({ ...prev, question: e.target.value }))}
                          placeholder="¿Cuál es tu pregunta?"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`a-${faq.id}`}>Respuesta</Label>
                        <Textarea
                          id={`a-${faq.id}`}
                          value={editState.answer}
                          onChange={(e) => setEditState((prev) => ({ ...prev, answer: e.target.value }))}
                          rows={4}
                          placeholder="Escribe la respuesta completa..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(faq)} disabled={savingId === faq.id}>
                          <Check className="h-4 w-4" />
                          {savingId === faq.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-2 whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(faq)}>
                          Editar
                        </Button>
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-3">¿Eliminar definitivamente?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(faq.id)}
                              disabled={deletingId === faq.id}
                            >
                              {deletingId === faq.id ? "Eliminando..." : "Sí, eliminar"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(faq.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Estado vacío */}
        {faqs.length === 0 && !showNewForm && (
          <div className="rounded-xl border border-dashed border-edge bg-canvas py-14 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-ink-3">
              Sin preguntas frecuentes aún
            </p>
            <p className="mt-1 text-xs text-ink-4">
              Agrega preguntas para que el agente las responda automáticamente.
            </p>
          </div>
        )}
      </div>

      {/* Formulario nueva FAQ */}
      {showNewForm && (
        <div className="rounded-xl border border-edge bg-surface-raised p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Nueva pregunta frecuente</p>
          <div className="space-y-1.5">
            <Label htmlFor="new-question">Pregunta</Label>
            <Input
              id="new-question"
              value={newFaq.question}
              onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="¿Cuál es tu pregunta?"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-answer">Respuesta</Label>
            <Textarea
              id="new-answer"
              value={newFaq.answer}
              onChange={(e) => setNewFaq((prev) => ({ ...prev, answer: e.target.value }))}
              rows={4}
              placeholder="Escribe la respuesta completa que el agente utilizará..."
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateFaq} disabled={savingNew}>
              <Check className="h-4 w-4" />
              {savingNew ? "Creando..." : "Crear pregunta"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowNewForm(false); setNewFaq({ question: "", answer: "" }); }}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
