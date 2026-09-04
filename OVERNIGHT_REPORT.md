# MimicryDB — Overnight development report

**Session:** 2026-09-05 00:00 → 08:00 (auto-scheduled) · **Workspace:** `C:\Research\01_Active_Projects\MimicryDB` · **Generated:** 2026-09-05 07:55

## TL;DR

The MVP is **live**: https://zyyang0124.github.io/MimicryDB/ — deployed from `main` by GitHub Actions, verified end-to-end (homepage, rankings, detail pages). CI green. 17/17 tests. Local network to github.com was flaky all night (pushes eventually landed at 01:05 and 01:45), and the pre-existing Pages workflow failure turned out to be GitHub rejecting the old flow-style workflow file at validation (zero jobs) — fixed by rewriting it in canonical block style.

## Repository

- URL: https://github.com/ZyYang0124/MimicryDB
- Branch: `main` · HEAD: `c28426e` (docs: OVERNIGHT_REPORT + log)
- Commits this session: 22 (baseline + 20 iterations + report), all semantic (`feat:`/`fix:`/`ci:`/`docs:`/`test:`/`chore:`)

## GitHub Pages

- **Status: VERIFIED LIVE — https://zyyang0124.github.io/MimicryDB/**
- Pages API: `status: built`, `build_type: workflow`
- Deploy run: "Deploy to GitHub Pages" → **success** on `fa286c2` (Actions API)
- End-to-end checks (fetched via external reader after local DNS for `*.github.io` proved unreliable from this machine): homepage renders hero + network visualization; `/models/` renders the full ranking table; `/interactions/MIMICRY-000002/` renders title, summary, modalities, provenance and related records; CSS served from `/MimicryDB/_astro/…` (no base-path 404s)

## CI

- **PASS** — GitHub Actions "CI" run: `completed / success` on `fa286c2` (Actions API; runs validate:data → check → test → build on Node 22)

## Implemented

1. **Scientific schema** — migration `002_scientific_schema.sql`: full taxon hierarchy, `taxon_synonym`, `biological_entity`, controlled vocabularies (`mimicry_type` / `signal_modality` / `receiver_role`, M2M), `interaction_reference` M2M, `interaction_geography`, `candidate` inbox with LLM extraction provenance, `evolutionary_origin` (`ORIGIN:NNNNNN`), query indexes, published-only RLS on interaction-scoped tables
2. **Portal (PHASE 4)** — `/models/`, `/mimics/` rankings with evidence-threshold filter; `/references/` index + detail; global `/search/`; sortable, URL-persisted-filter interaction explorer with cross-kingdom filter; homepage directed mimic→model SVG network (node size = record count, teal = cross-kingdom); evidence-grade distribution chart; 404; robots.txt; complete document metadata
3. **Data pipeline (PHASE 6, §53–54)** — `validate:data` (CI-gated), `export:data` (CSV set + metadata + SHA256; v0.3.0 dry-run OK), `generate:seed` → `supabase/seed.sql` (demo rows seed as `candidate`, invisible under RLS), `release-data.yml` manual release workflow
4. **Curator tooling (PHASE 5 demo)** — `/curator/` dashboard prototype with candidate inbox + extraction provenance; CSV import pre-check with atomic-reject policy + template (§45)
5. **Data layer (§48)** — `data.query()` paged/filterable documented query patterns defining the Supabase adapter contract; `detectDuplicates` honoring the no-global-uniqueness rule (§46)
6. **Dataset** — 12 demo interactions across Animalia/Plantae/Fungi (incl. the viceroy/monarch case with its Batesian/Müllerian dispute visible); every row DEMO-labeled; references are placeholders, no fabricated DOIs
7. **Docs** — DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY, ROADMAP (with reference-project borrowings: GloBI, GBIF, iNaturalist, CoL, EoL, WoRMS, POWO, OTL; NSII, CoL China, eFlora), ARCHITECTURE, DATABASE_SCHEMA, EVIDENCE_GUIDELINES; full README (§60); CHANGELOG
8. **Repo infra** — MIT LICENSE (software; data license decision documented as open), 5 issue templates + PR template (§63–64), accessibility pass (`html lang`, nav labels; audit clean on all 60 built pages), 800 internal links / 0 broken

## Testing

`node:test` suites: **17/17 pass** (unique well-formed public IDs, required fields + DEMO disclosure, evidence grades, directionality, kingdom flow, provider round-trip, taxa consistency, duplicate policy, CSV escaping/parsing, vocab conformance, candidate provenance, seed sync, query API). `astro check`: 0 errors. `astro build`: 60 pages. CI (GitHub Actions): **PASS**.

## Not yet implemented

- Live `SupabaseDataProvider` — blocked on project credentials; interface + swap point ready
- Curator authentication / write workflow (needs Supabase Auth + roles)
- LLM extraction pipeline over a real literature corpus
- Phylogenetic distance / independent-origin inference (schema reserved)

## External configuration still required

1. **Supabase project**: URL + publishable key (`.env.example` placeholders ready), then migrations 001–002 + seed
2. **Data license decision**: CC BY 4.0 vs CC0 (`docs/RELEASE_POLICY.md`) — must not be decided silently
3. Nothing else: Pages is configured (`build_type: workflow`) and deploying automatically

## Scientific architecture notes

- Publication ≠ interaction ≠ taxon pair ≠ independent origin; observation ≠ evaluation ≠ inference — enforced by schema, vocabularies and RLS
- No claim without provenance; LLM output is candidate-only; demo data labeled on every surface and can never auto-publish
- The frontend↔data contract (`DataProvider.query`) is fixed now so the live adapter needs no UI changes

## Next recommended development priority

Provision the Supabase project, run migrations 001–002 + generated seed, and implement `SupabaseDataProvider` against the documented query contract — then begin gold-standard curation of the first 300–500 interactions.
