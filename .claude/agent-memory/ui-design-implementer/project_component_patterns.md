---
name: AgentsLeads component patterns
description: Established visual patterns and conventions for all UI components
type: project
---

# Component Patterns — AgentsLeads

## Cards
- Standard card: `rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm`
- Hover card (clickable): add `transition-all hover:-translate-y-0.5 hover:shadow-md`
- Semantic card (hot): `border-lead-hot/20 bg-lead-hot-surface`

## Page headers
- Pattern: icon chip + title + subtitle
  ```tsx
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10">
      <Icon className="h-4 w-4 text-signal" />
    </div>
    <h1 className="text-lg font-semibold text-ink">Title</h1>
  </div>
  <p className="mt-1 text-sm text-ink-3">Subtitle</p>
  ```

## Section headers (analytics/conversations)
- Pattern: colored accent bar + uppercase label
  ```tsx
  <div className="flex items-center gap-2">
    <div className="h-3.5 w-1 rounded-full bg-signal" />
    <h2 className="text-xs font-bold uppercase tracking-widest text-ink-3">Section</h2>
  </div>
  ```

## Welcome banner
- Solid dark indigo/violet gradient (NOT a subtle tint — opaque deep color):
  `style={{ background: "linear-gradient(135deg, #2d1b69 0%, #1e3a8a 60%, #312e81 100%)" }}`
- Decorative circles use `rgba(255,255,255,0.06)` etc. (inline style since these are hardcoded decorative values on a dark bg)
- Text is always white/rgba on this card — use inline styles since token system is light/dark aware but this card is always dark
- CTA button: white background, dark blue text: `style={{ background: "#ffffff", color: "#1e3a8a" }}`
- Sparkles icon + "BIENVENIDO" label + h1 + CTA button

## Stats operational cards (Total Leads / Nuevos Hoy)
- Layout: label (top-left, uppercase tiny) + icon chip (top-right) + large number + subtitle
- Icon chip: `h-8 w-8 rounded-xl bg-signal/10` with `text-signal` icon
- Number: `font-mono text-4xl font-bold tabular-nums text-ink`
- Grid: always `grid-cols-2 gap-4`

## Icon chips for stats cards
- Small colored bg rounded square with icon:
  `flex h-9 w-9 items-center justify-center rounded-xl bg-signal/10` + `text-signal` icon

## Page headers — Leads/Clientes style (Figma March 2026)
- Large title without icon chip: `text-2xl font-semibold text-ink`
- Subtitle: `mt-1 text-sm text-ink-3`
- Action buttons (Exportar / Actualizar) on the right:
  `inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-canvas hover:text-ink`
- These buttons require a `"use client"` component (`LeadsPageHeader`) since they call `router.refresh()` / `window.location.href`

## Filter bars
- Wrap in card: `rounded-2xl border border-edge bg-surface-raised p-4 shadow-sm`
- Inputs inside use `bg-canvas` (slightly deeper than card) for visual nesting
- Result count at bottom-right: plain `text-xs tabular-nums text-ink-3` (muted, NOT signal color, NOT a pill/badge)
- Search input: full flex-1 with `relative` wrapper + `<Search>` icon `absolute left-2.5` + `pl-8` on input
- Date range: calendar icon only on the "from" input, plain "a" text separator, no Desde/Hasta labels
- Handoff dropdown default item label is "Handoff" (not "Handoff: todos")
- Puntaje IA: inline label + input combined with border: `flex items-center gap-0 overflow-hidden rounded-md border border-edge bg-canvas` + label has `border-r border-edge px-2.5 text-[11px]` + input has `border-0 bg-transparent shadow-none focus-visible:ring-0`

## Table — Leads style
- Table is wrapped in `rounded-2xl border border-edge bg-surface-raised` (no separate card)
- Header cells: `text-[11px] font-semibold uppercase tracking-wider text-ink-3`
- Row borders: `border-b border-edge last:border-0` (not the default TableRow border)
- Row hover: `hover:bg-canvas` — NO per-row classification tints (no `bg-lead-hot-surface` on rows)
- Phone cells: `<Phone>` icon h-3 w-3 text-ink-4 + mono text
- Date cells: `<CalendarDays>` icon h-3 w-3 text-ink-4 + mono text
- Status badge shape: `rounded-full` (pill, not `rounded-md`) for active states
- Status dot animation: use `animate-ping` for bot_active and human_active; static dot for resolved/lost
- BotToggleButton "Pausar" action: uses `<Pause>` icon (block/square), NOT `<PauseCircle>`
- HandoffBadge color mapping: urgent → lead-hot tokens; requested → lead-warm tokens; observer → lead-cold tokens; technical → neutral edge/surface tokens. Never use hardcoded Tailwind `red-500`/`amber-500`/`blue-500`.
  ```tsx
  <span className="relative flex h-1.5 w-1.5 shrink-0">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-bot-active" />
    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bot-active" />
  </span>
  ```

## Sidebar
- Collapsible: `useState(false)` toggle, `w-60` expanded / `w-16` collapsed
- Collapse toggle: absolute positioned button `-right-3 top-[60px]`, circular `h-6 w-6`
- Active nav item: `bg-signal/15 text-signal` (not full signal bg)
- User avatar: `bg-signal/15 text-signal` initials chip

## Conversation stat cards (StatusBars)
- All 4 cards are ALWAYS rendered (never show empty-state placeholder — 0 counts are valid)
- Each card: label + icon chip (top row) + large mono number + subtitle + border-t footer with badge
- "Agente activo": green Live dot (animate-pulse) + "Live" text; footer shows "gestionadas por IA"
- "Requieren atención": yellow icon when active, neutral when zero; footer "Sin pendientes" in green when zero
- "Resueltos": uses `bot-active` color scheme (green); always shows badge in footer
- "Perdidas": uses `lead-cold` color scheme (red); always shows badge in footer
- Badges at footer: `inline-flex items-center gap-1 rounded-full bg-X/10 px-2 py-0.5 text-[10px] font-semibold text-X-text`

## DonutChart
- Empty state: shows the ring with center number "0\ntotal", "Sin leads clasificados" text, legend dots row below
- Filled state: segments + center number + legend dots row below
- Legend is a horizontal row of dot + label pairs, not a vertical list with counts
- Center text: number (fontSize 20, bold monospace) + "total" label (fontSize 8)
- Ring radius R=38, strokeWidth=11

## WeeklySparkline
- Header: title (left) + "● Activos" badge (right, signal color)
- Subtitle: "Últimas N total" (small, ink-3)
- Area stroke width: 2 (slightly thicker than before)

## SettingsTabs (settings nav)
- Active tab: `border-signal text-signal font-medium` — purple underline + purple text
- Inactive tab: `border-transparent text-ink-3 hover:text-ink-2 hover:border-edge-strong`
- Tab border: `border-b-2 -mb-px` (underline indicator, not a background highlight)
- The settings layout header uses `text-2xl font-bold text-ink` (matches screenshot; this page is an exception to the `text-lg font-semibold` convention used elsewhere)

## AgentPromptEditor
- Info banner icon: wrapped in `h-8 w-8 rounded-lg bg-signal/10` chip, `text-signal` icon (NOT bare icon)
- Plan badge: amber/gold pill — `border-amber-400/60 bg-amber-400/10 text-amber-700 dark:text-amber-400` with `<Lock>` icon
- Detected content header: `text-[10px] font-semibold uppercase tracking-widest text-ink-4` (all-caps, tiny)
- Variable pills (amber): `border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-400`
- Block pills (purple/signal): `border-signal/40 bg-signal/10 text-signal` when paired, `border-destructive/40 bg-destructive/10 text-destructive` when unpaired
- Editor textarea: `bg-zinc-950` (dark code editor), `text-zinc-100`, monospace, `placeholder:text-zinc-600`
- Character counter: positioned as absolute overlay `bottom-2 right-3` inside the editor div (NOT in footer)
- Footer: only contains progress bar (`bg-signal`) + Save button with `<Save>` icon (`gap-1.5`)
- Save button: `size="sm"` with `className="gap-1.5"` and `<Save className="h-3.5 w-3.5" />`
