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
cd chore-app/backend && npm install && npx prisma migrate dev --name init && npm run dev
cd chore-app/frontend && npm install && npm run dev
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

**`chore-app/backend/.env`**
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

---

## Additional Documentation

Check these files when working on the relevant areas:

| Topic | File |
|---|---|
| Architectural patterns, design decisions, conventions | `.claude/docs/architectural_patterns.md` |
