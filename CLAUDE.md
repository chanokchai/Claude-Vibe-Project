# CLAUDE.md

## Project Overview

**Office Chore Board** — a shared team calendar for scheduling and tracking recurring office chores. No authentication; designed for LAN use.

Single app lives in `chore-app/` as a monorepo with separate `backend/` and `frontend/` workspaces.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express 4, TypeScript 5 (strict) |
| ORM / DB | Prisma 5 + SQLite (dev) / PostgreSQL-compatible |
| Frontend | React 18, Vite 5, TypeScript 5 (strict) |
| UI | FullCalendar 6, Tailwind CSS 3 |

---

## Key Directories

```
chore-app/
  backend/
    src/
      server.ts          # Express app setup, middleware, route mounting
      routes/            # One file per feature domain (chores, members, completions)
      lib/recurrence.ts  # Recurrence expansion logic (isolated business logic)
    prisma/
      schema.prisma      # 3 models: TeamMember, Chore, Completion
      migrations/        # Prisma migration history
  frontend/
    src/
      App.tsx            # Root component; owns global modal + members state
      api/client.ts      # Centralized typed API fetch wrapper (singleton)
      components/        # CalendarView, ChoreModal, HistoryDrawer, TeamMembersPanel
      types.ts           # Shared TS interfaces used by components + API client
```

---

## Essential Commands

### Backend (`chore-app/backend/`)
```bash
npm run dev          # ts-node-dev with hot reload (port 3000)
npm run build        # tsc → dist/
npm start            # node dist/server.js

npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate (after schema changes)
npm run db:studio    # Prisma Studio GUI
```

### Frontend (`chore-app/frontend/`)
```bash
npm run dev          # Vite dev server (port 5173, proxies /api → :3000)
npm run build        # tsc + vite build → dist/
npm run preview      # Preview production build
```

### First-time Setup
```bash
# Backend
cd chore-app/backend
cp .env.example .env        # create env file before anything else
npm install
npx prisma migrate dev --name init
npm run dev

# Frontend (separate terminal)
cd chore-app/frontend
npm install
npm run dev
```

---

## API Surface

```
GET    /api/chores/occurrences?start=&end=   # Expanded calendar events
POST   /api/chores                            # Create chore
PUT    /api/chores/:id                        # Update chore
DELETE /api/chores/:id                        # Delete (cascades completions)
GET    /api/chores/:id/history                # Completion history

GET    /api/members                           # List members
POST   /api/members                           # Add member
DELETE /api/members/:id                       # Remove (unassigns chores)

POST   /api/completions                       # Mark occurrence complete
DELETE /api/completions/:id                   # Unmark completion
```

---

## Environment

Copy `.env.example` to `.env` before running migrations or the dev server:
```bash
cp chore-app/backend/.env.example chore-app/backend/.env
```

**`chore-app/backend/.env`**
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

---

## Domain Model

Three Prisma models (`backend/prisma/schema.prisma`):

**TeamMember** — a person on the team.
- `id`, `name`, `createdAt`
- Deleting a member sets `assignedToId → null` on their chores (chores preserved).

**Chore** — a recurring task definition (not a single occurrence).
- `title`, `description?`
- `assignedToId?` → FK to TeamMember
- `recurrence`: `"none" | "daily" | "weekly" | "monthly"`
- `recurrenceDays?`: JSON string — weekday keys for weekly (`["mon","wed"]`), day numbers for monthly (`[1,15]`)
- `startDate`, `endDate?`
- Deleting a chore cascades to all its Completions.

**Completion** — records that one specific occurrence was done.
- `choreId` → FK to Chore (cascade delete)
- `completedBy`: free-text name string (not a FK)
- `occurrenceDate`: which calendar occurrence was marked complete
- `completedAt`: wall-clock time of the action

**CalendarEvent** (frontend-only, `frontend/src/types.ts:28`) — a FullCalendar event derived by expanding a Chore through `lib/recurrence.ts`. Never persisted.

---

## Frontend State & Actions

State lives in `App.tsx`. No external state library.

| State | Type | Purpose |
|---|---|---|
| `modal` | `ModalState` discriminated union | Controls which modal (if any) is open |
| `showTeamPanel` | `boolean` | Team members side panel visibility |
| `members` | `TeamMember[]` | Loaded once on mount, passed as prop |
| `refreshKey` | `number` | Increment to force calendar + members reload |
| `calendarRefreshRef` | `ref` | Imperative handle to trigger FullCalendar refetch |

**ModalState** (`App.tsx:8`):
```
{ type: 'none' }
{ type: 'create'; defaultDate?: string }
{ type: 'view'; event: CalendarEvent }
```

**Key actions and what they trigger:**
- Chore saved/deleted → `handleSaved` → increments `refreshKey` + calls `calendarRefreshRef`
- Member added/removed → `handleMembersChange` → increments `refreshKey` (re-fetches members)
- Date clicked on calendar → `setModal({ type: 'create', defaultDate })`
- Event clicked on calendar → `setModal({ type: 'view', event })`

---

## Working on New Features

1. **Create a branch first** — always, before touching any code:
   ```bash
   git checkout -b feature/<short-name>
   ```
2. Work on all changes in that branch for the remainder of the session.
3. When done, commit and push the branch; open a PR to `master`.

**Where to add things:**
- New API endpoint → new file in `backend/src/routes/` + mount in `server.ts`
- New business logic → `backend/src/lib/`
- New UI section → new file in `frontend/src/components/`
- New shared type → `frontend/src/types.ts`
- New API method → `frontend/src/api/client.ts`
- Schema change → edit `prisma/schema.prisma` then `npm run db:migrate`

---

## Fixing Bugs

1. **Create a branch first** — always, before touching any code:
   ```bash
   git checkout -b fix/<short-description>
   ```
2. Work on all changes in that branch for the remainder of the session.

**Checklist:**
- Recurrence expansion wrong? → `backend/src/lib/recurrence.ts`
- API returning unexpected data? → matching route file in `backend/src/routes/`
- Calendar not refreshing after mutation? → `handleSaved` in `App.tsx` (check both `refreshKey` and `calendarRefreshRef`)
- Modal showing stale data? → verify `event` prop passed to `ChoreModal` is the updated object
- DB schema mismatch? → run `npm run db:generate` after any schema edit

---

## Additional Documentation

Check these files when working on the relevant areas:

| Topic | File |
|---|---|
| Architectural patterns, design decisions, conventions | `.claude/docs/architectural_patterns.md` |

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`github.com/chanokchai/Claude-Vibe-Project`). See `docs/agents/issue-tracker.md`.

### Triage labels

Using default canonical label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
