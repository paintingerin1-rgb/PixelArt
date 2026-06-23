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

- auth needs to do 4 things:

1. register
2. login
3. logout
4. track if someone is logged in

steps - run constructor - check if there is a session - if not create one - check user loggin status

**What I did**

- Built login, register, and a empty canvas page
- Built AuthService with signUp, signIn, signOut, and session tracking
- Added routing for login/register/canvas
- Added a logout button and displayed the logged-in user's email

**Concepts**

- BehaviorSubject holds a current value and pushes updates to anything subscribed — like a newsletter, new subscribers get the current edition immediately, not just future ones
- AuthService doesn't track login with a boolean — it holds the actual session object, or null if logged out
- getSession() checks for an existing session once on startup (in case someone refreshes the page already logged in). onAuthStateChange() listens forever for future changes (login, logout). Need both — one without the other misses something
- Getters (get currentUser()) let you read a value like a property instead of calling a function
- Components can only use a service's properties in the template if the service is injected as public, not private

**Bug**

- Login failed, email didn't show after registering
- "Confirm email" was on in Supabase — accounts weren't active until confirmed

## Phase 3 - canvas

converted obserables to - asReadonly()
converted everything to allign with signals rather than behaviour subjects

**Bug**

- didn't save file, had to - cat to figure out that it was running wrong file.
