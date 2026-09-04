# Changelog

All notable changes to MimicryDB. Versions follow semver; data releases are tagged `data-vX.Y.Z` (see docs/RELEASE_POLICY.md).

## [0.3.0] — 2026-09-05 (overnight iteration)

### Added
- Scientific schema migration 002: taxon hierarchy + synonyms, biological entities, controlled vocabularies (mimicry type / signal modality / receiver role), interaction↔reference M2M, geography, candidate inbox with LLM extraction provenance, evolutionary origins, indexes, published-only RLS on related tables
- Portal: `/models/`, `/mimics/` rankings with evidence-threshold filter, `/references/` index + detail, global `/search/`, sortable interaction table with URL-persisted filters and cross-kingdom filter, homepage directed mimic→model network (inline SVG)
- Interaction detail: signal modalities, knowledge status, structured references, related records
- Data pipeline: `npm run validate:data` (CI-gated), `npm run export:data`, `npm run release:data`, `release-data.yml` workflow
- Curator dashboard static prototype with candidate inbox demo
- Policy docs: DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY, ROADMAP; full README structure
- Repo infrastructure: MIT LICENSE (software), issue templates, PR template, CHANGELOG

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
