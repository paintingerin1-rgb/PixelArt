## Phase 1 — Project Setup

**What I did**

- Set up Angular project connected to Supabase
- Created a SupabaseService to hold the client connection
- Stored credentials in environment.ts (gitignored)

**concepts**

- Services hold logic, not visuals — one shared instance across the app
- Dependency injection means Angular hands services to components rather than components creating their own
- Environment files keep keys out of git

**Mistake**

- whoops enabled SSR by accident. Supabase uses localStorage which doesn't exist on a server — would've caused problems later. Deleted and started fresh with
- Had to force push to main to replace the old setup. Bad practice on a team, but hopefully fine in this case because i'm the only one on the repo
