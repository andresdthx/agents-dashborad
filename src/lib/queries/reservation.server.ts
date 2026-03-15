/**
 * Server-side queries for client_reservation_config.
 * Re-exports from the Server Action so the page can call a single function.
 * Uses service role — safe to call from Server Components only.
 */
export { getReservationConfig } from "@/lib/actions/reservationConfig";
