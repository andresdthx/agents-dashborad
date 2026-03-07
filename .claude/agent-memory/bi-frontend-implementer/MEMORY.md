# BI Frontend Implementer — Memoria del Agente

## Patrones de implementación confirmados

### Queries SQL agregado (A3)
- `getLeadStats()` usa 9 queries paralelas con `{ count: "exact", head: true }` — NO descarga filas en memoria
- El campo `yesterday` se calcula con `gte(yesterday).lt(today)` para delta en StatsCards
- El `.or("score.gte.100,order_confirmed_at.not.is.null")` funciona en Supabase JS v2 para hotConfirmed

### Separación por rol (A1)
- En Server Components: `supabase.from("client_users").select("role, client_id").eq("user_id", user?.id).limit(1).single()`
- Si `role === "super_admin"` se hace early return con `<AdminDashboard />`
- El rol se detecta ANTES de cargar cualquier otra data para evitar queries innecesarias

### Nombre de usuario (deuda técnica)
- Orden de precedencia: `user.user_metadata?.full_name ?? email.split("@")[0].split(".")[0] ?? "usuario"`

### AdminDashboard (A2)
- Componente en `src/components/dashboard/AdminDashboard.tsx`
- `getGlobalStats()` y `getClientsSummary()` en `src/lib/queries/clients.ts`
- `getClientsSummary()` aún descarga leads en memoria para agrupar (trade-off aceptable sin RLS por client_id)
- Top 10 ranking ordenado por `total_leads desc`

### Filtros avanzados en LeadsTable (M1, M2)
- Filtros nuevos en URL: `dateFrom`, `dateTo`, `minScore`, `sortBy`, `sortDir`
- `dateTo` se convierte a `lt(dateTo + 1 día)` para incluir el día completo
- `sortBy` válido: `"score" | "created_at" | "classification" | "updated_at"` — se valida en el Server Component antes de pasarlo a la query
- Los encabezados clickeables usan un componente interno `SortIcon` con `ArrowUp/ArrowDown/ArrowUpDown` de lucide-react
- `handleSort` está definido dentro del componente con `useCallback`

### StatusBars (M4)
- Refactorizado de 3 a 4 tarjetas: Agente activo / Requieren atención / Resueltos / Perdidos
- Tasa de éxito: `resolved / (resolved + lost) * 100` — solo se muestra si `finalized > 0`
- Resueltos usa tokens `text-lead-warm-text / bg-lead-warm-surface`
- Perdidos usa tokens `text-lead-cold-text / bg-lead-cold-surface`
- El skeleton de StatusBars en `loading.tsx` cambió de `grid-cols-3` a `grid-cols-4`

### bot_paused_reason en tabla (M5)
- Se renderiza como texto secundario debajo del badge de estado
- `max-w-[180px] truncate` con `title` completo en tooltip nativo
- Solo se muestra cuando `lead.bot_paused && lead.bot_paused_reason`

### Skeleton states (deuda técnica)
- Reemplazar siempre `bg-zinc-100 dark:bg-zinc-800` por `bg-surface-raised`
- El token `bg-surface-raised` funciona en ambos modos sin necesitar el dark: modificador

## Archivos modificados en la sesión BI (Mar 2026)
- `src/lib/queries/leads.ts` — getLeadStats (SQL agregado), getLeads (filtros + sort)
- `src/lib/queries/clients.ts` — getGlobalStats(), getClientsSummary(), interfaces ClientSummary/GlobalStats
- `src/components/dashboard/AdminDashboard.tsx` — NUEVO componente para super_admin
- `src/components/dashboard/StatsCards.tsx` — campo yesterday + TodayDelta
- `src/components/dashboard/StatusBars.tsx` — 4 tarjetas separadas + tasa de éxito
- `src/components/leads/LeadsTable.tsx` — filtros fecha/puntaje, ordenamiento de columnas, bot_paused_reason
- `src/app/(dashboard)/dashboard/page.tsx` — detección de rol, early return AdminDashboard
- `src/app/(dashboard)/dashboard/leads/page.tsx` — nuevos SearchParams, validación sortBy
- `src/app/(dashboard)/dashboard/leads/[id]/page.tsx` — extracted_data + reasoning cards
- `src/app/(dashboard)/dashboard/loading.tsx` — tokens corregidos, 4 cols en status
- `src/app/(dashboard)/dashboard/leads/loading.tsx` — tokens corregidos

## KPIs/métricas expuestas en UI
- `today` + delta vs `yesterday` — en StatsCards strip operacional
- `hotConfirmed` / `hotPending` — en StatsCards card hot y dashboard banner
- `resolved` / `lost` separados + tasa de éxito — en StatusBars
- `reasoning` del clasificador IA — en lead detail (card con whitespace-pre-wrap)
- `extracted_data` — en lead detail como key-value con keys humanizadas
- Top 10 clientes por leads — en AdminDashboard
- Distribución global Hot/Warm/Cold — en AdminDashboard
