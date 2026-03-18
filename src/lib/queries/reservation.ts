/**
 * Client-side queries for client_reservation_config.
 * Used by ReservationBlockManager (browser Supabase client).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ClientReservationConfig, ReservationOutputField } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

export type { ReservationOutputField, ClientReservationConfig };
