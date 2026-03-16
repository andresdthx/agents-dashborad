---
name: AgentsLeads OKLch token system
description: Complete token system for AgentsLeads — surfaces, text hierarchy, lead temps, bot states
type: project
---

# Token System — AgentsLeads

## Surface tokens (elevation ladder)
- `bg-canvas` — page background (lowest)
- `bg-surface` / `bg-surface-raised` — card backgrounds
- `bg-surface-overlay` — modals, hover states

## Text hierarchy
- `text-ink` — primary headings
- `text-ink-2` — secondary labels
- `text-ink-3` — muted/caption text
- `text-ink-4` — disabled/placeholder

## Border hierarchy
- `border-edge` — default card borders
- `border-edge-subtle` — chart gridlines
- `border-edge-strong` — progress bar tracks

## Brand
- `bg-signal` / `text-signal` / `text-signal-fg` — indigo accent color (primary CTA, active nav, badges)
- `bg-signal/10`, `bg-signal/12` — signal surface tints for banners

## Lead temperature
- Hot: `text-lead-hot-text`, `bg-lead-hot-surface`, `border-lead-hot/20`
- Warm: `text-lead-warm-text`, `bg-lead-warm-surface`, `border-lead-warm/25`
- Cold: `text-lead-cold-text`, `bg-lead-cold-surface`, `border-lead-cold/25`

## Bot states
- Active: `text-bot-active-text`, `bg-bot-active-surface`, `bg-bot-active`
- Paused: `text-bot-paused-text`, `bg-bot-paused-surface`, `bg-bot-paused`

**Why:** OKLch tokens automatically adjust for dark/light mode. Hardcoded slate/zinc/hex colors break dark mode.
**How to apply:** NEVER use `text-zinc-*`, `text-gray-*`, `bg-white`, `bg-slate-*`, or hex values.
