
# AI Workplace Productivity Assistant — Build Plan

A modern SaaS-style productivity dashboard with 5 real AI-powered tools, KPI analytics including a "Time Saved" metric, and a light/dark theme toggle. No login or database — usage counters live in localStorage so the dashboard still feels alive.

## Scope

In:
- Sidebar shell + responsive layout (collapsible, mobile drawer)
- Light/dark mode toggle (persisted)
- Dashboard with KPI cards (Emails, Meetings, Tasks, Reports, Time Saved) + charts + Quick Actions
- 5 tool pages, each calling Lovable AI for real output: Email Generator, Meeting Summarizer, Task Planner, Research Assistant, AI Chat
- Edit / Copy / Regenerate / Export-TXT on outputs; meeting summary + research as structured sections
- Streaming chat (AI SDK `useChat`) with suggested prompts
- AI disclaimer banner on every tool page
- Usage tracking in localStorage → drives KPIs + charts
- Settings page (theme, clear usage data)

Out (can add later):
- Auth, accounts, cloud persistence, sharing
- PDF export (TXT/Markdown only for v1; PDF needs extra deps)
- Saved version history across sessions
- Rich text editor toolbar (textarea + markdown render is enough for v1)

## Pages / Routes

```
/                      Dashboard (KPIs, charts, quick actions)
/email                 Smart Email Generator
/meetings              Meeting Notes Summarizer
/planner               AI Task Planner
/research              AI Research Assistant
/chat                  AI Chat
/analytics             Analytics (expanded charts, time-saved breakdown)
/settings              Theme + clear-data
/api/chat              Streaming chat endpoint (server route)
```

All page routes share a `_app.tsx` pathless layout that renders sidebar + header.

## Design System

- Palette mapped into `src/styles.css` as semantic tokens (oklch equivalents of #4F46E5 primary, #F8FAFC bg, etc.). Dark variants in `.dark`.
- Inter font via Google Fonts link in `__root.tsx`.
- shadcn components: `sidebar`, `card`, `button`, `input`, `textarea`, `select`, `tabs`, `dialog`, `dropdown-menu`, `badge`, `sonner`, `chart`.
- Charts: Recharts (already bundled with shadcn `chart`) — line for trends, bar for weekly activity, donut for tool distribution.

## Time-Saved Logic

Per-activity savings (minutes): Email 5, Meeting 20, Task 15, Research 30, Chat 2.

`useUsage()` hook reads/writes `localStorage["wpa-usage"]`:
```
{ events: [{ tool, minutesSaved, at: ISO }] }
```
Derived: totals by tool, totals this week / month / lifetime, daily series for charts. Every successful AI call calls `recordUsage(tool)`.

## AI Wiring (Lovable AI Gateway, no mocks)

Server-only helper `src/lib/ai-gateway.server.ts` exports `createLovableAiGatewayProvider` (per knowledge file).

Server functions in `src/lib/ai.functions.ts` (client-safe path), one per tool, using `generateText` with `google/gemini-3-flash-preview`:
- `generateEmail({ recipient, purpose, tone, context })`
- `summarizeMeeting({ transcript, meetingType })` → `Output.object` with executiveSummary, keyDecisions[], actionItems[{task,owner,due}], risks[], nextSteps[]
- `planTasks({ goal, timeline, priority })` → milestones, tasks, dependencies
- `researchTopic({ topic, depth })` → overview, keyFindings[], trends[], opportunities[], risks[], references[]

Streaming chat route `src/routes/api/chat.ts` uses `streamText` + `toUIMessageStreamResponse`; client uses `@ai-sdk/react` `useChat` with `DefaultChatTransport`.

Ensure `LOVABLE_API_KEY` is provisioned via `ai_gateway--create`.

## File Plan (new files)

```
src/styles.css                         (update tokens to brand palette + Inter)
src/routes/__root.tsx                  (add Inter font link, theme bootstrap, Sonner)
src/routes/_app.tsx                    (sidebar layout)
src/routes/index.tsx                   (Dashboard – replaces placeholder)
src/routes/_app.email.tsx
src/routes/_app.meetings.tsx
src/routes/_app.planner.tsx
src/routes/_app.research.tsx
src/routes/_app.chat.tsx
src/routes/_app.analytics.tsx
src/routes/_app.settings.tsx
src/routes/api/chat.ts
src/components/app-sidebar.tsx
src/components/app-header.tsx          (search stub, theme toggle, profile menu)
src/components/kpi-card.tsx
src/components/quick-actions.tsx
src/components/ai-disclaimer.tsx
src/components/output-toolbar.tsx      (Copy / Regenerate / Export / Edit)
src/components/charts/*                (trend, weekly, distribution)
src/components/tools/email-form.tsx
src/components/tools/meeting-summary.tsx
src/components/tools/task-plan.tsx
src/components/tools/research-report.tsx
src/hooks/use-theme.ts
src/hooks/use-usage.ts
src/lib/usage.ts                       (constants + derive helpers)
src/lib/ai-gateway.server.ts
src/lib/ai.functions.ts
```

Route filenames use the existing dot-flat convention (`_app.email.tsx` etc.) so `_app.tsx` is the layout.

## Dependencies to Add

`ai`, `@ai-sdk/openai-compatible`, `@ai-sdk/react`, `zod`, `date-fns`. (Recharts + lucide already present via shadcn.)

## Build Order

1. Add deps, provision `LOVABLE_API_KEY`, update design tokens + font, add theme hook.
2. Create `_app` layout with sidebar + header; replace `/` with dashboard scaffold + KPI cards using zero state.
3. Add `useUsage` + charts; verify dashboard renders.
4. Build server helper + server functions; build each tool page one by one (Email → Meetings → Planner → Research), each writing a usage event on success.
5. Build streaming `/api/chat` + chat page.
6. Analytics + Settings.
7. QA: load each route, run an AI call per tool, confirm KPIs update, toggle dark mode, check mobile drawer.

## Notes / Trade-offs

- No persistence across browsers/devices since auth is out of scope; we'll make that explicit in Settings copy.
- Export = `.txt`/`.md` download via Blob; PDF deferred to avoid heavy deps.
- Rich text editing replaced with auto-resizing textarea + markdown preview to keep scope tight; can upgrade to TipTap later.
- All AI prompts mirror the spec's structured templates verbatim inside the server functions.
