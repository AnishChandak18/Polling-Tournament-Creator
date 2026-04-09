# Stadium Pulse

**Stadium Pulse** is a social IPL prediction experience: create private circles with friends, cast your picks on match day, and climb the leaderboard—for bragging rights only. No money, no stakes—just the fun of calling the game.

## What you can do

- **Circles** — Create or join a private group and compete on your own leaderboard.
- **Predictions** — Vote on matches when voting opens on match day.
- **Rankings** — See how you stack up in each circle and chase the top spot.

The app is built around the Indian Premier League schedule and is meant for fans who enjoy the ritual of predictions and friendly rivalry.

## For developers

If you want to run the project locally:

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and add your Supabase URL, anon key, and database URL (see the example file for placeholders).
3. In the Supabase dashboard, enable email/password (and optional Google) sign-in, and add your local app URL plus `/auth/callback` and `/reset-password` to the allowed redirect URLs.
4. Start the app: `npm run dev`

Do not commit real secrets—keep them in `.env.local` only (see `.gitignore`).

## Production

- Set the same environment variables on your host (e.g. Vercel project settings) using values from `.env.local.example`—never commit real keys.
- Build with `npm run build` and run with `npm start`, or use your platform’s default Next.js integration.
- Before the app serves traffic against a new database, run migrations: `npm run db:deploy:prod` (requires `DATABASE_URL` in the environment; use your production Postgres URL).
- In Supabase, set **Site URL** and **Redirect URLs** to your production domain (including `https://your-domain/auth/callback` and `https://your-domain/reset-password`).

For deeper technical notes, explore the codebase and `package.json` scripts.
