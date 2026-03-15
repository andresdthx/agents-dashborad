/**
 * Client-side queries for client_reservation_config.
 * Used by ReservationBlockManager (browser Supabase client).
 */
import type { ReservationOutputField } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export type { ReservationOutputField };

export interface ClientReservationConfig {
  id: string;
  client_id: string;
  output_fields: ReservationOutputField[];
  block_enabled: boolean;
  created_at: string;
  updated_at: string;
}
