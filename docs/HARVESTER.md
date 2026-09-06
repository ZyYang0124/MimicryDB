# Literature Harvester

MVP **0.4.1** (SOP Phases 6–8). The harvester is a long-running discovery pipeline, not a data dump: scholarly APIs → dedup → candidate corpus. It follows the SOP's top priority order — schema/ontology/provenance/curation come before data quantity.

## Pipeline position

```
Literature Discovery (this module)
        ↓
literature_candidate corpus (data/harvest/candidates.json)
        ↓ (v0.5) LLM screening → (v0.5) full-text resolver → (v0.5) extraction
        ↓
candidate interaction inbox → human curation → published records
```

## Hard rules

1. Candidates **never** write the scientific database; screening/extraction/curation do.
2. Search queries live in versioned **search profiles**, never in code (SOP Phase 6.2/27): `data/harvest/search-profiles.json`. Changing a query requires a profile version bump, so systematic-review provenance stays answerable.
3. Every run leaves **provenance** (`data/harvest/runs.json`): run_id, source, profile + version, timestamps, records seen/new/duplicate/error, status, error log.
4. Sync health is measured by **`last_successful_sync`** — never by last attempt (SOP Phase 24).
5. Irrelevant literature is **excluded with a reason, never deleted** (SOP Phase 10): ontology changes can re-screen, and the same paper never burns tokens twice.
6. API-first: Crossref now; OpenAlex and Europe PMC next. No publisher-page scraping.

## Dedupe ladder (SOP Phase 8) — before anything expensive

1. DOI exact match (normalized: lowercase, no `https://doi.org/` prefix)
2. Normalized title match (lowercased, tags stripped, punctuation collapsed; confidence 0.9)

Collisions are **recorded on the existing candidate** (`dedupe[]` with method, confidence, matched_doi) and never silently merged. Duplicate items create no new candidate.

## Usage

```bash
npm run harvest -- PROFILE:MIMICRY_GENERAL
npm run harvest -- PROFILE:ANT_MIMICRY
npm run harvest -- PROFILE:MIMICRY_GENERAL --source crossref
```

Incremental by construction: existing DOIs/titles are skipped; re-running the same profile yields `new 0, duplicate N`.

## Definition of Done (Harvester MVP) — status

- ✓ Incremental query against a scholarly API (Crossref)
- ✓ Query/search profile not hardcoded (versioned JSON)
- ✓ Run provenance recorded
- ✓ DOI auto-normalization
- ✓ Duplicates never create candidates
- ✓ API failure recoverable (run marked `failed`, `last_successful_sync` preserved)
- ✓ Retry does not duplicate (dedupe ladder)
- ✓ Single bad record doesn't crash the run (per-item isolation, logged)
- ✓ Fixture tests (offline pure-function suite)
- ✓ Logs (runs.json)
- ✓ `last_successful_sync`
- ◻ Scheduled execution (GitHub Actions cron — wire when harvest cadence is decided; avoid surprise commits)

## Next (0.4.2+)

OpenAlex source adapter; candidate_duplicate table with fuzzy-title tier; LLM screening queue (0.5.0) gated by a relevance threshold benchmarked against the gold-standard set (0.9.0).
