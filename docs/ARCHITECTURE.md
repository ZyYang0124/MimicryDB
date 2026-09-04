# Architecture

MimicryDB is a statically rendered scientific portal backed by a normalized PostgreSQL schema.

## Frontend

Astro 4 + TypeScript + Tailwind CSS renders the public portal for GitHub Pages (`/MimicryDB/` base path). All pages are prerendered; interactivity (search, filters, sorting) is small vanilla scripts, so the site remains fast and dependency-light. Visualization on the homepage is inline SVG computed at build time — no chart library.

## Data access

Pages never query a backend directly. They import a single `DataProvider` from `src/data/provider.ts`:

- `demoProvider` (active) — typed local dataset in `src/data/demo.ts`, clearly labeled DEMO
- `SupabaseDataProvider` (planned) — same interface over Supabase REST; service-role credentials never enter the client bundle

This is the single swap point for going live; the UI is untouched by the switch.

## Schema

PostgreSQL migrations live in `supabase/migrations/`:

- `001_initial.sql` — taxon, reference, mimicry_interaction, evidence, audit_log with public-read RLS limited to published interactions
- `002_scientific_schema.sql` — full hierarchy fields, taxon synonyms, biological entities, controlled vocabularies (mimicry type / signal modality / receiver role), interaction↔reference M2M, geography, candidate inbox with LLM extraction provenance, evolutionary origins, query indexes, published-only visibility for interaction-scoped tables

`supabase/seed.sql` is generated from the demo dataset by `npm run generate:seed` and seeds demo rows as `candidate` so they stay invisible under RLS. The schema separates observation, evaluation, inference, and provenance; workflow status is independent of knowledge status.

## Pipeline

- `npm run validate:data` — dataset integrity + vocabulary conformance (runs in CI)
- `npm run export:data` — versioned CSV release set + metadata + SHA256 checksums into `export/`
- `npm run generate:seed` — regenerate `supabase/seed.sql`
- `npm run release:data` — validate + export; `.github/workflows/release-data.yml` attaches the set to a GitHub Release

## CI/CD

GitHub Actions: `ci.yml` (validate → typecheck → tests → build), `deploy-pages.yml` (push to main → build → deploy Pages), `release-data.yml` (manual data release). Authentication and authorization belong to Supabase Auth + RLS.

## Design references

See `docs/ROADMAP.md` for the biodiversity portals this design borrows from (GloBI, GBIF, iNaturalist, Catalogue of Life, WoRMS/POWO, NSII, eFlora).
