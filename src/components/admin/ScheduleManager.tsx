"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveSchedule } from "@/lib/actions/reservationConfig";
import {
  DAYS_OF_WEEK,
  HOURS_0_23,
  SLOT_DURATIONS,
  DEFAULT_DURATION,
  dbToSchedule,
  scheduleToDb,
  formatHour,
  type ScheduleSlot,
  type WeeklyScheduleDb,
} from "@/lib/schedule";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  clientId: string;
  initialSchedule: WeeklyScheduleDb | null;
}

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        enabled ? "bg-signal" : "bg-edge"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// SlotRow — a single time range within a day
// ---------------------------------------------------------------------------

function SlotRow({
  slot,
  index,
  dayKey,
  onUpdate,
  onRemove,
}: {
  slot: ScheduleSlot;
  index: number;
  dayKey: string;
  onUpdate: (dayKey: string, index: number, field: "start" | "end", value: number) => void;
  onRemove: (dayKey: string, index: number) => void;
}) {
  const startOptions = HOURS_0_23.filter((h) => h < slot.end);
  const endOptions = HOURS_0_23.filter((h) => h > slot.start);

  return (
    <div className="flex items-center gap-2">
      <select
        value={slot.start}
        onChange={(e) => onUpdate(dayKey, index, "start", Number(e.target.value))}
        className="h-8 rounded-md border border-edge bg-canvas px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
        aria-label="Hora de inicio"
      >
        {startOptions.map((h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </select>

      <span className="text-xs text-ink-4" aria-hidden="true">
        →
      </span>

      <select
        value={slot.end}
        onChange={(e) => onUpdate(dayKey, index, "end", Number(e.target.value))}
        className="h-8 rounded-md border border-edge bg-canvas px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
        aria-label="Hora de fin"
      >
        {endOptions.map((h) => (
          <option key={h} value={h}>
            {formatHour(h)}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onRemove(dayKey, index)}
        className="ml-1 rounded p-1 text-ink-4 transition-colors hover:bg-surface-overlay hover:text-destructive"
        aria-label="Eliminar franja horaria"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayRow — one day with its toggle, summary and expandable slot list
// ---------------------------------------------------------------------------

function DayRow({
  dayKey,
  label,
  isEnabled,
  isExpanded,
  slots,
  onToggle,
  onToggleExpand,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: {
  dayKey: string;
  label: string;
  isEnabled: boolean;
  isExpanded: boolean;
  slots: ScheduleSlot[];
  onToggle: (key: string) => void;
  onToggleExpand: (key: string) => void;
  onAddSlot: (key: string) => void;
  onUpdateSlot: (key: string, i: number, field: "start" | "end", v: number) => void;
  onRemoveSlot: (key: string, i: number) => void;
}) {
  const summary =
    slots.length > 0
      ? slots.map((s) => `${formatHour(s.start)}–${formatHour(s.end)}`).join(", ")
      : "Sin franjas";

  return (
    <div
      className={cn(
        "rounded-xl border border-edge bg-surface-raised shadow-sm transition-opacity",
        !isEnabled && "opacity-60"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="flex-1 text-left disabled:cursor-default"
          onClick={() => isEnabled && onToggleExpand(dayKey)}
          aria-expanded={isExpanded}
          disabled={!isEnabled}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-ink">{label}</span>
            {isEnabled && (
              <span className="text-xs text-ink-4">{summary}</span>
            )}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Toggle
            enabled={isEnabled}
            onToggle={() => onToggle(dayKey)}
            label={isEnabled ? `Desactivar ${label}` : `Activar ${label}`}
          />
          {isEnabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onToggleExpand(dayKey)}
              aria-label={isExpanded ? "Colapsar" : "Expandir"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-ink-4" />
              ) : (
                <ChevronDown className="h-4 w-4 text-ink-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded panel */}
      {isEnabled && isExpanded && (
        <div className="border-t border-edge px-4 pb-4 pt-3 space-y-3">
          {slots.length === 0 && (
            <p className="text-xs text-ink-4">
              Sin franjas configuradas. Agrega al menos una para que el bot pueda agendar este día.
            </p>
          )}

          <div className="space-y-2">
            {slots.map((slot, i) => (
              <SlotRow
                key={i}
                slot={slot}
                index={i}
                dayKey={dayKey}
                onUpdate={onUpdateSlot}
                onRemove={onRemoveSlot}
              />
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddSlot(dayKey)}
          >
            <Plus className="h-4 w-4" />
            Agregar franja
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScheduleManager — main component
// ---------------------------------------------------------------------------

export function ScheduleManager({ clientId, initialSchedule }: Props) {
  const router = useRouter();
  const { slots: initialSlotsMap, duration: initialDuration } = dbToSchedule(initialSchedule);
  const initialEnabled = new Set(
    Object.keys(initialSlotsMap).filter((k) => (initialSlotsMap[k]?.length ?? 0) > 0)
  );

  const [enabledDays, setEnabledDays] = useState<Set<string>>(initialEnabled);
  const [slotsMap, setSlotsMap] = useState<Record<string, ScheduleSlot[]>>(initialSlotsMap);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Toggle day on/off ─────────────────────────────────────────────────────

  const handleToggleDay = useCallback((key: string) => {
    setEnabledDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setExpandedDay((e) => (e === key ? null : e));
      } else {
        next.add(key);
        setSlotsMap((prev) => {
          if (!prev[key] || prev[key].length === 0) {
            return { ...prev, [key]: [{ start: 9, end: 18 }] };
          }
          return prev;
        });
        setExpandedDay(key);
      }
      return next;
    });
    setIsDirty(true);
  }, []);

  // ── Expand / collapse ─────────────────────────────────────────────────────

  const handleToggleExpand = useCallback((key: string) => {
    setExpandedDay((prev) => (prev === key ? null : key));
  }, []);

  // ── Slot CRUD ─────────────────────────────────────────────────────────────

  const handleAddSlot = useCallback((dayKey: string) => {
    setSlotsMap((prev) => {
      const existing = prev[dayKey] ?? [];
      const lastEnd = existing.length > 0 ? existing[existing.length - 1].end : 8;
      const newStart = Math.min(lastEnd + 1, 22);
      const newEnd = Math.min(newStart + 2, 23);
      return { ...prev, [dayKey]: [...existing, { start: newStart, end: newEnd }] };
    });
    setIsDirty(true);
  }, []);

  const handleRemoveSlot = useCallback((dayKey: string, index: number) => {
    setSlotsMap((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] ?? []).filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, []);

  const handleUpdateSlot = useCallback(
    (dayKey: string, index: number, field: "start" | "end", value: number) => {
      setSlotsMap((prev) => {
        const slots = [...(prev[dayKey] ?? [])];
        const current = slots[index];
        const updated = { ...current, [field]: value };
        if (field === "start" && updated.end <= value) updated.end = value + 1;
        if (field === "end" && updated.start >= value) updated.start = value - 1;
        slots[index] = updated;
        return { ...prev, [dayKey]: slots };
      });
      setIsDirty(true);
    },
    []
  );

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    for (const dayKey of Array.from(enabledDays)) {
      for (const slot of slotsMap[dayKey] ?? []) {
        if (slot.end <= slot.start) {
          toast.error("La hora de fin debe ser mayor a la de inicio");
          return;
        }
      }
    }

    const activeSchedule: Record<string, ScheduleSlot[]> = {};
    for (const dayKey of Array.from(enabledDays)) {
      activeSchedule[dayKey] = slotsMap[dayKey] ?? [];
    }
    const payload =
      Object.keys(activeSchedule).length > 0
        ? scheduleToDb(activeSchedule, duration)
        : null;

    setSaving(true);
    const { error } = await saveSchedule(clientId, payload);
    setSaving(false);

    if (error) {
      toast.error("Error al guardar la agenda");
    } else {
      const { slots: saved, duration: savedDuration } = dbToSchedule(payload);
      const savedEnabled = new Set(
        Object.keys(saved).filter((k) => (saved[k]?.length ?? 0) > 0)
      );
      setSlotsMap(saved);
      setEnabledDays(savedEnabled);
      setDuration(savedDuration);
      setIsDirty(false);
      toast.success("Agenda guardada");
      router.refresh();
    }
  }, [clientId, enabledDays, slotsMap, duration, router]);

  const activeDaysCount = enabledDays.size;

  return (
    <div className="w-full space-y-5">

      {/* Info banner + duration selector */}
      <div className="rounded-xl border border-edge bg-surface-raised shadow-sm px-4 py-3">
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 shrink-0 text-signal mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Disponibilidad semanal</p>
            <p className="mt-0.5 text-xs text-ink-4">
              Define los días y horarios en que el bot puede agendar citas en Google Calendar.
            </p>
            {activeDaysCount === 0 && (
              <p className="mt-1 text-xs text-ink-3">
                Sin días configurados — el bot usará los horarios globales del sistema como fallback.
              </p>
            )}
          </div>

          {/* Duration selector */}
          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="slot-duration" className="text-xs text-ink-4 whitespace-nowrap">
              Duración de cita
            </label>
            <select
              id="slot-duration"
              value={duration}
              onChange={(e) => { setDuration(Number(e.target.value)); setIsDirty(true); }}
              className="h-8 rounded-md border border-edge bg-canvas px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
            >
              {SLOT_DURATIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {DAYS_OF_WEEK.map(({ key, label }) => (
          <DayRow
            key={key}
            dayKey={key}
            label={label}
            isEnabled={enabledDays.has(key)}
            isExpanded={expandedDay === key}
            slots={slotsMap[key] ?? []}
            onToggle={handleToggleDay}
            onToggleExpand={handleToggleExpand}
            onAddSlot={handleAddSlot}
            onUpdateSlot={handleUpdateSlot}
            onRemoveSlot={handleRemoveSlot}
          />
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!isDirty || saving} size="sm">
          {saving ? "Guardando..." : "Guardar agenda"}
        </Button>
      </div>

    </div>
  );
}
