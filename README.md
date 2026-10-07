# AI365 Production Dashboard

An internal content-production progress dashboard for tracking the completion of the AI365 project.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Architecture Decisions
- Uses Next.js Server Components and Server Actions extensively to reduce client-side JavaScript.
- Supabase is used as the single source of truth for both data and authentication.
- No separate backend server is required. Next.js handles all API and Server Action requests.

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Go to SQL Editor and run the migration script located at `supabase/migrations/0001_initial.sql`.
3. (Optional) Run the seed script `supabase/seed.sql` to populate some initial metrics.
4. Go to **Authentication -> Providers** and ensure Email provider is enabled.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following keys from your Supabase project (Settings -> API):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Do NOT include the service_role key here)*

### 3. Running Locally
Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Creating the First Admin
When you create the first user through the sign-up or login process (if you enable sign-ups), the database trigger `handle_new_user` will automatically assign the `ADMIN` role to the very first user created in the database. Subsequent users will be assigned the `VIEWER` role by default, which an `ADMIN` can later change.

### 5. Vercel Deployment
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel's Environment Variables settings.
4. Deploy. Next.js will build and deploy correctly without any further configuration.

## Features
- **Real-time KPI Tracking:** View the current status of Videos Uploaded, Bundles Left to Edit, and SR + Script Ready metrics.
- **Update History:** Every single update is logged atomically with the user, timestamp, and previous/new values.
- **Role-Based Access:** ADMIN, EDITOR, and VIEWER roles enforce who can edit metrics vs only view them.
- **Daily Activity Feed:** Gives management an immediate glance at what work was completed today.
