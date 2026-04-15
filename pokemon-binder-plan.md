# 🃏 Pokémon Card Binder — Full Project Plan (TypeScript)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| External API | PokéTCG API (pokemontcg.io) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Folder Structure

```
pokemon-binder/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (CardGrid, Navbar, etc.)
│   │   ├── pages/            # Route-level components (Home, Collection, Search)
│   │   ├── hooks/            # Custom hooks (useCollection, useAuth, etc.)
│   │   ├── types/            # TypeScript interfaces & types
│   │   ├── lib/              # Supabase client, API helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
│
└── server/                   # Express backend
    ├── src/
    │   ├── routes/           # collection.ts, wishlist.ts, cards.ts
    │   ├── middleware/        # auth.ts (verify Supabase JWT)
    │   ├── types/            # Shared TypeScript types
    │   ├── controllers/      # Business logic
    │   └── index.ts          # Entry point
    ├── tsconfig.json
    └── package.json
```

---

## Initial Setup Commands

### 1. Create the frontend
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install react-router-dom @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Create the backend
```bash
mkdir server && cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js
npm install -D typescript ts-node-dev @types/express @types/cors @types/node
npx tsc --init
```

### 3. Add a dev script to server/package.json
```json
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts"
}
```

---

## Key TypeScript Types (start here — `client/src/types/pokemon.ts`)

These are the types you'll use everywhere. Defining these early makes the rest of the app
much smoother to build.

```typescript
// The shape of a card returned from the PokéTCG API
export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp: string;
  types: string[];
  rarity: string;
  set: CardSet;
  images: {
    small: string;
    large: string;
  };
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  total: number;
  images: {
    symbol: string;
    logo: string;
  };
}

// A row in your Supabase collection table
export interface CollectionCard {
  id: string;
  user_id: string;
  card_id: string;       // matches PokemonCard.id
  quantity: number;
  added_at: string;
}

// A row in your wishlist table
export interface WishlistCard {
  id: string;
  user_id: string;
  card_id: string;
  added_at: string;
}
```

---

## Database Schema (Supabase / PostgreSQL)

Run these in the Supabase SQL editor:

```sql
-- Users are managed automatically by Supabase Auth

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

-- Row-level security: users can only see their own data
alter table collection enable row level security;
alter table wishlist enable row level security;

create policy "Users can manage their own collection"
  on collection for all using (auth.uid() = user_id);

create policy "Users can manage their own wishlist"
  on wishlist for all using (auth.uid() = user_id);
```

---

## TypeScript Things You'll Learn in This Project

| Feature | Where you'll use it |
|--------|-------------------|
| `interface` | Typing API responses, DB rows, component props |
| `type` | Union types, utility types like `Partial<T>` |
| Generics | `useState<PokemonCard[]>`, typed API fetch wrappers |
| `async/await` with types | Fetching from PokéTCG API with typed returns |
| Typed React props | Every component you build |
| `?.` optional chaining | Accessing nested API data safely |
| Enums | Card types, rarities, filter options |
| Supabase generated types | Run `supabase gen types` for fully typed DB access |

---

## Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] Project scaffolding (client + server folders, configs)
- [ ] Supabase project created, env variables set up
- [ ] Auth: Sign up, log in, log out
- [ ] Protected routes in React Router

### Phase 2 — Cards (Week 2)
- [ ] Card search page — hit PokéTCG API, display results
- [ ] Type the API response with your `PokemonCard` interface
- [ ] "Add to collection" button — POST to your Express API, save to Supabase
- [ ] Auth middleware on Express routes (verify Supabase JWT)

### Phase 3 — Collection (Week 3)
- [ ] Collection page — fetch user's cards, display as a binder grid
- [ ] Card detail modal — click a card to see full info
- [ ] Filter by type, set, rarity

### Phase 4 — Polish (Week 4)
- [ ] Wishlist feature
- [ ] Set completion tracker
- [ ] Loading states, error handling, empty states
- [ ] Deploy: Vercel + Railway

---

## Stretch Goals
- Market value tracker (TCGPlayer API)
- Shareable public binder link
- Pack opening simulator
- Export collection as CSV

---

## Useful Resources
- [PokéTCG API docs](https://docs.pokemontcg.io/)
- [Supabase docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
