/**
 * Helpers for the weekly schedule configuration.
 *
 * DB format (backend / Google Calendar):
 *   {
 *     "_duration": 120,          // slot duration in minutes (stored alongside day keys)
 *     "1": [18, 20],             // Mon: appointments start at 18:00 and 20:00
 *     "6": [8, 10, 12, 14, 16, 18]  // Sat: appointments every 2h from 8 to 18
 *   }
 *
 * Day keys: "0"=Sunday … "6"=Saturday
 * Values: sorted integer 24h hour values (appointment START times)
 * Duration: stored under "_duration" key (minutes), only whole-hour multiples supported
 */

/** A contiguous availability window in the UI (start/end are inclusive hour integers). */
export interface ScheduleSlot {
  start: number; // 0–23
  end: number;   // 1–23, always > start. Means "window closes at end:00, last slot starts at end - durationH"
}

/** DB wire format understood by the Google Calendar backend. */
export type WeeklyScheduleDb = {
  _duration?: number;
  [dayKey: string]: number[] | number | undefined;
};

export const DEFAULT_DURATION = 60;

/** Only whole-hour durations are supported (backend stores integer hours). */
export const SLOT_DURATIONS: { value: number; label: string }[] = [
  { value: 60,  label: "1 hora" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
];

/**
 * Days of the week ordered Mon→Sun (business convention).
 * key matches the DB string ("0"=Sunday, "1"=Monday, …, "6"=Saturday).
 */
export const DAYS_OF_WEEK = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
] as const;

const DAY_KEYS = new Set(["0", "1", "2", "3", "4", "5", "6"]);

/**
 * Convert UI windows + duration → DB format.
 * Each window [start, end] is expanded into appointment start times spaced by durationH hours.
 * Example: window {8, 20} + 2h → [8, 10, 12, 14, 16, 18]
 */
export function scheduleToDb(
  uiSlots: Record<string, ScheduleSlot[]>,
  duration: number
): WeeklyScheduleDb {
  const stepH = duration / 60;
  const db: WeeklyScheduleDb = { _duration: duration };

  for (const [dayKey, slots] of Object.entries(uiSlots)) {
    if (!DAY_KEYS.has(dayKey) || slots.length === 0) continue;
    const starts: number[] = [];
    for (const { start, end } of slots) {
      for (let t = start; t + stepH <= end; t += stepH) {
        starts.push(t);
      }
    }
    if (starts.length > 0) {
      db[dayKey] = [...new Set(starts)].sort((a, b) => a - b);
    }
  }

  return db;
}

/**
 * Convert DB format → UI windows.
 * Consecutive start times (spaced by durationH) are grouped back into a single window.
 * Example: [8, 10, 12, 14, 16, 18] + 2h → [{start:8, end:20}]
 */
export function dbToSchedule(db: WeeklyScheduleDb | null): {
  slots: Record<string, ScheduleSlot[]>;
  duration: number;
} {
  if (!db) return { slots: {}, duration: DEFAULT_DURATION };

  const duration =
    typeof db._duration === "number" ? db._duration : DEFAULT_DURATION;
  const stepH = duration / 60;
  const slots: Record<string, ScheduleSlot[]> = {};

  for (const [dayKey, value] of Object.entries(db)) {
    if (!DAY_KEYS.has(dayKey)) continue;
    if (!Array.isArray(value) || value.length === 0) continue;

    const starts = [...(value as number[])].sort((a, b) => a - b);
    const windows: ScheduleSlot[] = [];
    let winStart = starts[0];
    let prev = starts[0];

    for (let i = 1; i < starts.length; i++) {
      if (starts[i] === prev + stepH) {
        prev = starts[i];
      } else {
        windows.push({ start: winStart, end: prev + stepH });
        winStart = starts[i];
        prev = starts[i];
      }
    }
    windows.push({ start: winStart, end: prev + stepH });
    slots[dayKey] = windows;
  }

  return { slots, duration };
}

/** Format a 24h integer as "HH:00". */
export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

/** All valid hour values 0–23 used to populate selectors. */
export const HOURS_0_23 = Array.from({ length: 24 }, (_, i) => i);
