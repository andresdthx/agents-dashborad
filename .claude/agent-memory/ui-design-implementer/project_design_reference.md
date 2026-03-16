---
name: Reference design token mappings
description: Mapping from the Figma/Downloads/src reference design to AgentsLeads token system
type: project
---

# Reference Design → Token Mappings

Reference design is at `Downloads/src/app/components/{Layout,Dashboard,Clientes,Configuracion}.tsx`

## Color mappings
| Reference (hardcoded) | AgentsLeads token |
|---|---|
| `bg-slate-50` / `bg-white` | `bg-canvas` / `bg-surface-raised` |
| `text-slate-800` | `text-ink` |
| `text-slate-500`, `text-slate-400` | `text-ink-3`, `text-ink-4` |
| `border-slate-200` | `border-edge` |
| `bg-indigo-500` (active nav) | `bg-signal/15` + `text-signal` |
| `bg-indigo-600` (button) | `bg-signal text-signal-fg` |
| `#0f172a` sidebar bg | `bg-canvas` (uses dark mode token) |
| `bg-rose-400`, `text-rose-*` | `bg-lead-hot`, `text-lead-hot-text` |
| `bg-amber-400`, `text-amber-*` | `bg-lead-warm`, `text-lead-warm-text` |
| `bg-sky-400`, `text-sky-*` | `bg-lead-cold`, `text-lead-cold-text` |
| `bg-emerald-*`, `text-emerald-*` | `bg-bot-active-surface`, `text-bot-active-text` |
| `text-2xl font-bold` (headings) | `text-lg font-semibold text-ink` |

## Design patterns adopted from reference
1. Card-wrapped filter bars (Clientes.tsx) → implemented in LeadsTable
2. Welcome banner with gradient bg + decorative circles (Dashboard.tsx) → dashboard/page.tsx
3. Stats cards with icon chips and `text-3xl`/`text-4xl` numbers (Dashboard.tsx) → StatusBars, StatsCards
4. Sidebar collapsible with toggle button (Layout.tsx) → Sidebar.tsx
5. Section headers with accent bar instead of icon (Dashboard.tsx) → dashboard/page.tsx
6. Classification notice with bot icon chip → dashboard/page.tsx
7. Conversation cards with Live dot + icon chips per type (Dashboard.tsx) → StatusBars.tsx
