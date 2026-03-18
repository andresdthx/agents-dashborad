"use server";

import { createServiceClient } from "@/lib/supabase/service";
import type { ReservationOutputField } from "@/types/database";
import type { WeeklyScheduleDb } from "@/lib/schedule";

export interface ReservationConfigInput {
  output_fields: ReservationOutputField[];
  block_enabled: boolean;
}

/**
 * Fetch the reservation block configuration for a client.
 * Returns null when no config row exists (backend will use DEFAULT_RESERVATION_FIELDS).
 */
export async function getReservationConfig(
  clientId: string
): Promise<{ config: ReservationConfigInput | null; error: string | null }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("client_reservation_config")
    .select("output_fields, block_enabled")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) return { config: null, error: error.message };

  if (!data) return { config: null, error: null };

  return {
    config: {
      output_fields: (data.output_fields ?? []) as ReservationOutputField[],
      block_enabled: data.block_enabled ?? true,
    },
    error: null,
  };
}

// Claves del sistema que no cuentan hacia el límite de campos custom.
const SYSTEM_FIELD_KEYS = new Set(["fecha", "hora", "reserva_confirmada"]);
const CUSTOM_FIELD_LIMIT = 5;

/**
 * Upsert output_fields + block_enabled for a client.
 * Creates the row if it does not exist, updates it if it does.
 * block_enabled is always forced to true — the reservation block is critical.
 */
export async function saveReservationConfig(
  clientId: string,
  config: ReservationConfigInput
): Promise<{ error: string | null }> {
  const customFieldCount = config.output_fields.filter(
    (f) => !SYSTEM_FIELD_KEYS.has(f.key)
  ).length;
  if (customFieldCount > CUSTOM_FIELD_LIMIT) {
    return { error: `No se pueden guardar más de ${CUSTOM_FIELD_LIMIT} campos personalizados` };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("client_reservation_config")
    .upsert(
      {
        client_id: clientId,
        output_fields: config.output_fields,
        block_enabled: true, // siempre activo — bloque crítico del sistema
      },
      { onConflict: "client_id" }
    );

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Save only the confirmation_example text.
 * Requires migration 065_add_confirmation_example to be applied first.
 */
export async function saveConfirmationExample(
  clientId: string,
  example: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("client_reservation_config")
    .upsert(
      { client_id: clientId, confirmation_example: example },
      { onConflict: "client_id" }
    );

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Fetch the weekly schedule for a client.
 * Returns null when no config row exists or when schedule has not been set.
 */
export async function getSchedule(
  clientId: string
): Promise<{ schedule: WeeklyScheduleDb | null; error: string | null }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("client_reservation_config")
    .select("schedule")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) return { schedule: null, error: error.message };

  return {
    schedule: (data?.schedule as WeeklyScheduleDb | null) ?? null,
    error: null,
  };
}

/**
 * Save the weekly schedule for a client without touching other config fields.
 * Uses UPDATE when the row exists to avoid overwriting output_fields,
 * block_enabled, and confirmation_example. Falls back to INSERT (with DB
 * defaults for other columns) only when no row exists yet.
 */
export async function saveSchedule(
  clientId: string,
  schedule: WeeklyScheduleDb | null
): Promise<{ error: string | null }> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("client_reservation_config")
    .select("id")
    .eq("client_id", clientId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("client_reservation_config")
      .update({ schedule })
      .eq("client_id", clientId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("client_reservation_config")
      .insert({ client_id: clientId, schedule });
    if (error) return { error: error.message };
  }

  return { error: null };
}
