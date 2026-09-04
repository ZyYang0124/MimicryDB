# MimicryDB — Overnight development report

**Session:** 2026-09-05 00:00 → 08:00 (auto-scheduled) · **Workspace:** `C:\Research\01_Active_Projects\MimicryDB`

## Repository

https://github.com/ZyYang0124/MimicryDB — branch `main`, local HEAD at report time: `7872275` (chore: evidence grade distribution chart; README query-pattern docs; changelog consolidation) plus uncommitted report/log files.

## GitHub Pages

**NOT VERIFIED — NOT CLAIMED.** Direct connections to github.com failed all night (connection refused / reset). `git push origin main` was attempted repeatedly (see `OVERNIGHT_LOG.md`). The deploy workflow `.github/workflows/deploy-pages.yml` is in place and will trigger automatically on the first successful push; expected URL: https://zyyang0124.github.io/MimicryDB/

## CI

Workflow files are valid YAML and every command they run was executed locally with passing results: `npm run validate:data` ✓ · `npm run check` (0 errors) ✓ · `npm test` (17/17) ✓ · `npm run build` (60 pages) ✓. Remote CI run status: **UNVERIFIED — no push reached the remote.**

## Implemented (all committed locally, semantic history)

1. **docs/** — DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY, ROADMAP (incl. reference-project borrowings: GloBI, GBIF, iNaturalist, CoL, EoL, WoRMS, POWO, OTL, NSII, CoL China, eFlora), expanded ARCHITECTURE; full README (spec §60)
2. **Scientific schema** — migration `002_scientific_schema.sql`: taxon hierarchy + `taxon_synonym`, `biological_entity`, controlled vocabularies (mimicry type / signal modality / receiver role) with M2M joins, `interaction_reference` M2M, `interaction_geography`, `candidate` inbox with LLM extraction provenance, `evolutionary_origin`, indexes, published-only RLS on interaction-scoped tables (PHASE 3)
3. **Portal** — `/models/`, `/mimics/` rankings w/ evidence-threshold filter, `/references/` + detail pages, global `/search/`, sortable interactions table with URL-persisted filters + cross-kingdom filter, homepage directed mimic→model SVG network, evidence-grade distribution chart, 404, robots.txt, full document metadata (PHASE 4)
4. **Data pipeline** — `validate:data` (CI-gated), `export:data` (CSV set + metadata + SHA256), `generate:seed` → `supabase/seed.sql` (demo rows seed as `candidate`, invisible under RLS), `release:data`, `release-data.yml` manual workflow (PHASE 6, §53–54; honest dry-run against demo data)
5. **Curator tooling** — `/curator/` static dashboard prototype with synthetic candidate inbox (PHASE 5 demo); CSV import pre-check with atomic-reject policy + template (§45)
6. **Data layer** — `data.query()` documented paged/filter query patterns defining the Supabase adapter contract (§48); `detectDuplicates` honoring the no-global-uniqueness rule (§46)
7. **Dataset** — 12 demo interactions across Animalia/Plantae/Fungi incl. the viceroy/monarch case recorded with its Batesian/Müllerian dispute visible; every row DEMO-labeled
8. **Quality** — 17/17 tests (IDs, fields, grades, directionality, vocab, duplicates, CSV, candidates, seed sync, query API); astro check 0 errors; dist audits: 800 internal links / 0 broken, a11y checks clean on all 60 pages; CI on Node 22
9. **Repo infra** — MIT LICENSE (software), CHANGELOG, 5 issue templates + PR template (§63–64), baseline commit of prior session work

## Not yet implemented

- Live Supabase adapter (`SupabaseDataProvider`) — blocked on project credentials; interface + swap point ready
- Real curator authentication / write workflows (needs Supabase Auth + roles)
- LLM extraction pipeline writing real candidates (needs corpus + keys)
- Phylogenetic / geographic analysis layers (reserved by schema)

## External configuration still required

1. Network path to github.com (all pushes failed tonight — see log)
2. Supabase project URL + publishable key (`.env.example` placeholders ready)
3. GitHub Pages source set to "GitHub Actions" (one-time repo setting, if not already)
4. Data license decision: CC BY 4.0 vs CC0 (`docs/RELEASE_POLICY.md`)

## Scientific architecture notes

- Publication ≠ interaction ≠ taxon pair ≠ independent origin, and observation ≠ evaluation ≠ inference, are enforced in schema and vocabulary design
- No claim without provenance: evidence rows reference exact passages; LLM output stays candidate-only
- Demo data is labeled at every surface and can never auto-publish (RLS + seed policy)

## Next recommended development priority

Push the 20 local commits when connectivity returns; verify the Pages deployment; then wire `SupabaseDataProvider` to a live project and reconcile the demo taxa against Catalogue of Life before onboarding the first gold-standard curated records.
