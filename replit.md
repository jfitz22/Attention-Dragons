# Workspace

## Overview

Attention Dragons — Player Character Hub for tabletop RPG parties. Phase 1 implements the Inventory System. Built as a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Application

**Attention Dragons** is a multi-player web app where each tabletop RPG player manages their character's inventory via a personal hub. Features:

- Character selection screen with "Forge New Hero" capability
- Per-character inventory hub with dark fantasy aesthetic
- Item categories: Arms & Armaments (weapons), Vestments (armor), Curios & Trinkets (magic_items), Arcane Scrolls (scrolls), Alchemical Stores (potions), Mundane Goods (misc)
- Item cards with rarity color-coding (Common → Legendary)
- Charge tracking pip system with recharge conditions (Short Rest, Long Rest, Dawn, Never)
- Short Rest / Long Rest rest triggers that auto-recharge eligible items
- Consume / Use Charge actions on items
- Equipped vs. Stored visual states
- Add/Edit item modal with full form
- Search/filter by name or category
- Consumed items graveyard section

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── attention-dragons/  # React + Vite frontend (at route /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Database Schema

- `characters` — character profiles (name, playerName, characterClass, race, level, avatarUrl)
- `items` — inventory items (name, category, description, imageUrl, isEquipped, maxCharges, currentCharges, rechargeOn, rarity, isConsumable, isConsumed, isTrashed)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `health.ts` — GET /api/healthz
  - `characters.ts` — GET/POST /api/characters, GET /api/characters/:id, POST /api/characters/:id/rest
  - `items.ts` — full CRUD for /api/characters/:id/items + use and equip actions

### `artifacts/attention-dragons` (`@workspace/attention-dragons`)

React + Vite frontend. Routes:
- `/` — Character selection screen
- `/character/:characterId` — Character inventory hub

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/schema/characters.ts` — Characters table
- `src/schema/items.ts` — Items table with enums for category, rarity, rechargeOn
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec. Import from `@workspace/api-client-react` (barrel export).

### `scripts` (`@workspace/scripts`)

Utility scripts package.
