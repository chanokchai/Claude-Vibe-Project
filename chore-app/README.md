# Office Chore Board

A browser-based office chore management app with an Outlook-style shared calendar. No login required — it's an open shared board for the whole team.

## Features

- **Calendar view** — Month/week/day views powered by FullCalendar
- **Recurring chores** — Daily, weekly (pick days), or monthly (pick dates)
- **Color-coded events** — Blue (upcoming), Green (completed), Red (overdue)
- **Complete chores** — Click an event, enter your name, mark done
- **Completion history** — Full log per chore
- **Team members** — Add/remove members; assign chores to them
- **LAN-friendly** — Open from any machine on the same network

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

The API server starts at **http://localhost:3000**.

> The SQLite database file is created at `backend/prisma/dev.db`. All data is stored locally on the host machine.

### 2. Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

---

## LAN Access

Team members on the same network can access the app at the host machine's local IP address:

```
http://192.168.x.x:5173
```

To find your IP on Windows: run `ipconfig` and look for the IPv4 address under your network adapter.

The Vite dev server is configured with `host: true` so it binds to all interfaces automatically.

---

## Project Structure

```
chore-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── lib/
│   │   │   └── recurrence.ts   # Recurring chore expansion logic
│   │   ├── routes/
│   │   │   ├── chores.ts       # Chore CRUD + occurrence expansion
│   │   │   ├── completions.ts  # Mark complete / unmark
│   │   │   └── members.ts      # Team member management
│   │   └── server.ts           # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts       # Typed API fetch wrappers
│   │   ├── components/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── ChoreModal.tsx
│   │   │   ├── HistoryDrawer.tsx
│   │   │   └── TeamMembersPanel.tsx
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   └── main.tsx
│   └── package.json
└── README.md
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chores/occurrences?start=&end=` | Calendar events for a date range |
| POST | `/api/chores` | Create chore |
| PUT | `/api/chores/:id` | Update chore |
| DELETE | `/api/chores/:id` | Delete chore |
| GET | `/api/chores/:id/history` | Completion history |
| GET | `/api/members` | List team members |
| POST | `/api/members` | Add member |
| DELETE | `/api/members/:id` | Remove member |
| POST | `/api/completions` | Mark occurrence complete |
| DELETE | `/api/completions/:id` | Unmark completion |

---

## Switching to PostgreSQL (Cloud Deployment)

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```
3. Run `npx prisma migrate deploy`

---

## Verification Checklist

1. Start both servers (backend on :3000, frontend on :5173)
2. Open `http://localhost:5173`
3. Add 2-3 team members via **Team Members** panel
4. Create a one-time chore and a weekly recurring chore
5. Verify chores appear on correct calendar dates
6. Click a chore → enter name → Mark Complete → event turns green
7. View History from the chore detail modal
8. Edit chore title → verify calendar updates
9. Delete a chore → verify it disappears
10. Remove a team member → chores remain (unassigned)
