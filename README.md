# 🎨 Pix Art Studio

A collaborative pixel art canvas web app built with Angular and Supabase. Paint pixels, share your canvas with others, and watch changes appear live in real time.

---

## What it does

- Register and log in with email and password
- Paint on a personal 16×16 pixel canvas
- Your art is saved to the database and persists across refreshes
- Share your canvas with other users by searching their email
- Viewers can see your canvas via a shareable link
- Grant edit access to let others paint on your canvas too
- All changes sync live across every open browser — no refreshing needed

---

## Tech stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Frontend framework | Angular 19                                      |
| Backend / database | Supabase (Postgres)                             |
| Authentication     | Supabase Auth                                   |
| Real-time sync     | Supabase Realtime (Postgres Changes)            |
| Forms              | Angular Signal Forms (`@angular/forms/signals`) |
| State management   | Angular Signals                                 |

---

## Live demo

Deployed on Cloudflare Pages:
[https://717b70ac.pixelart-el7.pages.dev/login]
Note: If you’re unable to log in, it may be because my Supabase database is currently paused due to financial constraints.

## Running locally

### Prerequisites

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- Docker (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

### 1. Clone the repo

```bash
git clone https://github.com/paintingerin1-rgb/PixelArt.git
cd PixelArt/pix-art
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

Copy the example environment file and fill in your Supabase credentials:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Open `environment.ts` and add your Supabase URL and anon key. For local development these come from the Supabase CLI (step 5).

### 4. Start local Supabase

```bash
supabase start
```

This starts a local Postgres database, Auth server, and Realtime engine via Docker. Once running, it prints your local URL and anon key — copy these into `environment.ts`.

### 5. Apply the database schema

```bash
supabase db push
```

This applies all migrations — creating the tables, RLS policies, functions, and triggers your app depends on.

### 6. Run the app

```bash
ng serve
```

Open `http://localhost:4200` in your browser.

---

## Database schema

### `canvases`

One row per user canvas. Stores the owner, name, size, and whether it's shareable.

### `pixels`

One row per painted pixel. Stores canvas ID, coordinates (x, y), colour (hex string), who painted it, and when. Uses a unique constraint on `(canvas_id, x, y)` so repainting a cell updates the existing row rather than creating a duplicate — this is what makes upsert work correctly.

### `profiles`

A public mirror of `auth.users` containing just `id` and `email`. Populated automatically via a database trigger on user registration. Required because Supabase's `auth.users` table is locked down from the frontend — this table is what powers the search-by-email feature.

### `canvas_viewers`

One row per (canvas, user) pair with access. Has a `can_edit` boolean (default false) that controls whether a viewer can also paint. Used by RLS policies to determine who can see and write to a canvas.

---

## Key concepts

### Why one row per pixel instead of a JSON blob?

Storing the whole canvas as a single JSON column would mean two people painting different pixels simultaneously both try to rewrite the entire grid — they'd overwrite each other's work. Per-pixel rows mean each paint operation is a completely independent database write. Realtime also works naturally because each change is a discrete, broadcastable event.

### Row Level Security (RLS)

The database enforces access control independently of the frontend. Even direct API calls with a valid session token are subject to these policies:

- **Owners** can read and write their own canvas and pixels
- **Viewers** (`canvas_viewers` entry) can read the canvas and its pixels
- **Editors** (`can_edit = true`) can also write pixels
- **Everyone else** gets nothing — RLS blocks the query before any data is returned

This means security is enforced at the database layer, not just the UI layer.

### Realtime

Supabase keeps a WebSocket connection open between the browser and the database. When a pixel row changes, Supabase's Realtime engine detects it and pushes the new row data to every client subscribed to that canvas's channel. The Angular app receives it and updates just that one cell — not a full reload.

### Signals

Angular Signals. A signal holds a current value and Angular automatically tracks everywhere it's read — re-rendering only what actually changed when the value updates.

---

## What I learned

- How to design a relational database schema — tables, foreign keys, constraints, and why the data model choices you make early matter a lot later
- Row Level Security — enforcing access rules at the database level rather than trusting the frontend
- How real-time data sync actually works under the hood (WebSockets, Postgres publications, change broadcasts)
- Angular Signals and Signal Forms — Angular's newer reactive primitives
- The difference between a quick data model decision (JSON blob) and one that scales (per-row)
- Supabase local development workflow — running a full backend stack locally via Docker and pushing migrations to production
- Debugging RLS policies
- Working with git branches, pull requests, and responding to code review feedback throughout the project
