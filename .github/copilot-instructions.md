# Copilot Instructions — Abstracts Pattern (Assessor)

**Use this playbook for all new features. Keep it in sync with the abstracts implementation. Reference skills in `.claude/skills` (vercel-react-best-practices, web-interface-guidelines) and, when needed, the docs in `.github` (shadcn-ui-documentation.md, supabase-cli-documentation.md, postgres-documentation.md, base-ui-combobox.md, combobox-docs.md, nextjs-documentation.md).**

## Workflow (DB → Types → UI)

- **Database first**: add/modify tables and functions in schema files; prefer a single RPC per use case. If a flow needs multiple DB steps, design a new database function instead of chaining client calls.
- **Regenerate types after DB changes**: run the project script that updates `database-types.ts` every time the schema changes. Consume generated types directly in UI and actions.
- **Actions boundary**: all Supabase access lives in `components/<feature>/actions.ts`. Aim for one DB call per action. If more are needed, add a DB function.
- **UI build order**: implement UI for DB functions (server-first), then CRUD UI for tables using generated types.

## Data Fetching & Components

- **Server-first**: prefer Server Components; derive filters/pagination from URL params for deep-linkable views.
- **Client fetch**: only when interactivity demands it; use SWR with typed fetchers and stable keys (see `client-swr-dedup`). Disable focus/reconnect revalidation unless needed; use `mutate` for refresh/optimistic flows.
- **Caching**: use `React.cache` on server helpers for per-request dedup when safe (see `server-cache-react`). Avoid waterfalls; start promises early, await late (`async-parallel`, `async-dependencies`).

## UI Composition

- **Primitives**: compose from shadcn/ui and base components in `components/ui` (button, card, dialog, table, pagination, checkbox, toast via sonner, etc.). If a primitive is missing, add it to `components/ui` before feature code.
- **Forms**: prefer dialogs for create/edit; wire submit with `useActionState` for pending; keep buttons enabled until submit starts; show spinner + disable during flight; toast success/error.
- **Tables**: use base table + pagination; support checkbox selection; bulk actions call a single action function. For “select all”, fetch IDs via one RPC instead of looping pages.
- **Printing/secondary views**: dedicated server routes for print, using the same actions/types; apply print CSS.

## Actions & Error Handling

- Return consistent `ActionState` (success boolean, message, optional payload). Validate on server; log with context; surface user-friendly toasts.
- Keep actions single-call to Supabase; if you need sequencing, move it into a DB function.
- Prefer `rpc()` for complex logic; avoid duplicating business rules in application code.

## Performance & Bundle Rules (skills references)

- Avoid barrel imports that bloat bundles (`bundle-barrel-imports`); import only what you use.
- Hoist static formatters/JSX; memoize handlers (`useCallback`), lazy-init state (`rerender-lazy-state-init`), use functional setState (`rerender-functional-setstate`).
- Keep serialization minimal across RSC boundaries (`server-serialization`).
- Avoid waterfalls; use `Promise.all` where independent (`async-parallel`).

## Navigation & State

- Reflect UI state in URL (filters, pagination, tabs) so back/forward works. Use server params where possible.
- Use dialogs for forms; confirm destructive actions or provide undo window; toasts with polite `aria-live`.

## Testing & Dev Loop

- After schema change: update SQL → run types generation → implement/update actions → build UI → verify toasts/pending states and pagination/select-all behaviors.
- Use seed data; test realistic flows (list, filter, paginate, select all, create/edit/delete, print).

## When in doubt

- Add a new RPC to keep actions single-call.
- Favor server data flow; only move client-side when necessary, using SWR.
- Keep UI built from shared primitives; add missing primitives to `components/ui` first.
