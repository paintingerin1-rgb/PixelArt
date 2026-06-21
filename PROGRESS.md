## Phase 1 — Project Setup 17-18 June

**What I did**

- Set up Angular project connected to Supabase
- Created a SupabaseService to hold the client connection
- Stored credentials in environment.ts (gitignored)

**concepts**

- Services hold logic, not visuals — one shared instance across the app
- Dependency injection means Angular hands services to components rather than components creating their own
- Environment files keep keys out of git

**Mistake**

- whoops enabled SSR by accident. Supabase uses localStorage which doesn't exist on a server — would've caused problems later. Deleted and started fresh
- Had to force push to main to replace the old setup. Bad practice on a team, but hopefully fine in this case because i'm the only one on the repo

## Phase 2 - Authentication 19-June

- log in
- log out
- register
- isLoggedIn ?? - call server? - nope not angular - behaviour subject ?? idk - components subscribe to login state
  other components like canvas will automatically receive an update
  so like if my canvas is subsribed to a session it gets updates. like if a user logs in, it starts that session and info will be shared to the components otherwise it is NULL. BTW not a boolean

  - auth needs to do 4 things:
  1. register
  2. login
  3. logout
  4. track if someone is logged in

  constrcutor - checks for exisiting session + listens forever for future changes

  steps - run constructor - check if there is a session - if not create one - check user loggin status
