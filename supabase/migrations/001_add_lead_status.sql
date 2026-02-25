-- Migration: 001_add_lead_status
-- Adds a semantic status column to leads and updates toggle_bot_pause to keep it in sync.
--
-- ⚠️  BEFORE RUNNING:
--   1. Verify toggle_bot_pause return type in Supabase matches the RETURNS JSON below.
--   2. Run on a staging environment first, then production.
--   3. After deploying, update src/types/database.ts and activate Phase 2 frontend changes.

-- 1. Add status column with check constraint
ALTER TABLE leads
  ADD COLUMN status TEXT NOT NULL DEFAULT 'bot_active'
  CHECK (status IN ('bot_active', 'human_active', 'resolved', 'lost'));

-- 2. Backfill: leads that are already paused transition to human_active
UPDATE leads SET status = 'human_active' WHERE bot_paused = true;

-- 3. Replace toggle_bot_pause to keep status in sync with bot_paused
CREATE OR REPLACE FUNCTION public.toggle_bot_pause(
  p_lead_id UUID,
  p_bot_paused BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE leads
  SET
    bot_paused        = p_bot_paused,
    bot_paused_reason = CASE WHEN p_bot_paused THEN p_reason ELSE NULL END,
    bot_paused_at     = CASE WHEN p_bot_paused THEN NOW() ELSE bot_paused_at END,
    status            = CASE WHEN p_bot_paused THEN 'human_active' ELSE 'bot_active' END,
    updated_at        = NOW()
  WHERE id = p_lead_id;

  SELECT json_build_object(
    'id',                id,
    'bot_paused',        bot_paused,
    'bot_paused_reason', bot_paused_reason,
    'bot_paused_at',     bot_paused_at,
    'status',            status
  ) INTO result
  FROM leads
  WHERE id = p_lead_id;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$;
