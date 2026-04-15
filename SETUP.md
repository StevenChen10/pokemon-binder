please

# 🃏 Pokémon Binder — Setup Guide

Follow these steps in order. Takes about 20–30 minutes to get fully running.

---

## Step 1 — Scaffold the projects

Run these in your terminal from the `pokemon-binder/` root folder:

```bash
# Create the React frontend
npm create vite@latest client -- --template react-ts

# Set up the backend
cd server
npm install express cors dotenv @supabase/supabase-js
npm install -D typescript ts-node-dev @types/express @types/cors @types/node
```

Then inside `client/`:
```bash
cd ../client
npm install
npm install react-router-dom @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Step 2 — Configure Tailwind

In `client/tailwind.config.js`, update the content array:
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```

In `client/src/index.css`, replace everything with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 3 — Create a Supabase project

1. Go to https://supabase.com and create a free account
2. Click "New project" and fill in the details
3. Once it's ready, go to **Settings → API** and copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **anon / public key** → this is your `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4 — Run the database schema

In Supabase, go to **SQL Editor** and run this:

```sql
create table collection (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  card_id text not null,
  quantity integer default 1,
  added_at timestamp with time zone default now(),
  unique(user_id, card_id)
);

create table wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  card_id text not null,
  added_at timestamp with time zone default now(),
  unique(user_id, card_id)
);

alter table collection enable row level security;
alter table wishlist enable row level security;

create policy "Users can manage their own collection"
  on collection for all using (auth.uid() = user_id);

create policy "Users can manage their own wishlist"
  on wishlist for all using (auth.uid() = user_id);
```

---

## Step 5 — Set up environment variables

**In `server/`**, copy `.env.example` to `.env` and fill in your values:
```
PORT=3000
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**In `client/`**, copy `.env.example` to `.env` and fill in your values:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Step 6 — Copy the boilerplate files

Copy the files from this starter kit into the scaffolded project:

```
server/src/           ← copy all files from pokemon-binder/server/src/
server/tsconfig.json  ← replace the generated one
client/src/           ← copy all files from pokemon-binder/client/src/
```

> Note: Vite generates its own App.tsx and index.css — replace them with the ones from this kit.

---

## Step 7 — Add dev script to server/package.json

```json
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts",
  "build": "tsc"
}
```

---

## Step 8 — Run it!

Open two terminal tabs:

**Tab 1 — Backend:**
```bash
cd server
npm run dev
```

**Tab 2 — Frontend:**
```bash
cd client
npm run dev
```

Visit http://localhost:5173 — you should see the login page.

---

## Troubleshooting

- **CORS error?** Make sure the server is running on port 3000 and `client/src/lib/api.ts` points to `http://localhost:3000/api`
- **Supabase auth not working?** Double-check your `.env` values — a wrong key is the most common culprit
- **TypeScript errors on startup?** Run `npx tsc --noEmit` in the server folder to see all errors at once
