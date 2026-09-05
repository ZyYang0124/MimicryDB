# Changelog

All notable changes to MimicryDB. Versions follow semver; data releases are tagged `data-vX.Y.Z` (see docs/RELEASE_POLICY.md).

## [0.4.0] — 2026-09-05 evening iteration

### Added
- Model-kind axis: organism vs environment vs inanimate-object models (migration 003, vocabulary, filters, badges; new demo records Extatosoma tiaratum and Phrynarachne)
- GBIF backbone reconciliation pipeline (npm run reconcile:gbif) with full rank classification; surfaced on taxon pages; reviewable, never rewrites names
- Tree of Life homepage: GBIF-backed dendrogram with mimic/model distribution color-mapped (teal/coral/dark)
- Hasselblad-inspired interaction pages: sticky species photograph (Wikimedia Commons, attributed), editorial right column, literature-support section; species thumbnails in explorers
- Chinese version: mirrored /zh/ page tree (13 pages), language toggle, hreflang alternates, zh display summaries
- npm run fetch:images pipeline storing license/artist manifests (data/images.json)

### Changed
- Design system refresh: serif display headings, refined palette, grade-colored evidence badges, sticky header, data tables

## [0.3.0] — 2026-09-05 (overnight iteration)

### Added
- Scientific schema migration 002: taxon hierarchy + synonyms, biological entities, controlled vocabularies (mimicry type / signal modality / receiver role), interaction↔reference M2M, geography, candidate inbox with LLM extraction provenance, evolutionary origins, indexes, published-only RLS on related tables
- Portal: `/models/`, `/mimics/` rankings with evidence-threshold filter, `/references/` index + detail, global `/search/`, sortable interaction table with URL-persisted filters and cross-kingdom filter, homepage directed mimic→model network (inline SVG), evidence-grade distribution chart, branded 404, robots.txt, full document metadata
- Interaction detail: signal modalities, knowledge status, structured references, related records
- Data pipeline: `npm run validate:data` (CI-gated), `npm run export:data`, `npm run release:data`, `npm run generate:seed` → `supabase/seed.sql` (candidate-status demo rows), `release-data.yml` workflow
- Curator tooling: dashboard static prototype with candidate inbox demo; CSV import pre-check (`scripts/import-validate.mjs` + template) with atomic reject policy
- `data.query()` documented query patterns on the provider (paged, filterable) defining the Supabase adapter contract
- Demo dataset grown to 12 records incl. ant-mimicking spider, drone fly, and the viceroy/monarch case recorded with its Batesian/Müllerian dispute visible
- Policy docs: DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY, ROADMAP; full README structure; expanded ARCHITECTURE
- Repo infrastructure: MIT LICENSE (software), issue templates, PR template, CHANGELOG, accessibility pass (html lang, nav labels, a11y audit over all built pages)

### Changed
- CI upgraded to Node 22 (native TS type stripping for data tests), dataset validation step added
- Test suite grew from 1 placeholder test to 13 data-integrity tests

## [0.2.0] — 2026-09-04

- DataProvider abstraction (demo adapter; Supabase-ready swap point)
- Expanded demo dataset (9 records across Animalia/Plantae/Fungi, E1–E3)
- Interactions browsing with search + filters; taxa detail pages; evidence grades page; JSON export
- Real dataset tests (unique IDs, fields, grades, directionality, kingdom flow)

## [0.1.0] — 2026-09-04

- Initial Astro + Tailwind prototype: homepage, interactions list/detail, taxa list, download page
- Initial Supabase migration 001 (taxon, reference, mimicry_interaction, evidence, audit_log)
- GitHub Actions CI + GitHub Pages deployment workflow
