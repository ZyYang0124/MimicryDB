# MimicryDB Roadmap

Project status: **Alpha (v0.2.0)** — static prototype with labeled demo data. See `prompt.md` for the full project specification and `docs/EVIDENCE_GUIDELINES.md` for the evidence framework.

## Design references

MimicryDB borrows interaction-model and portal patterns from established biodiversity infrastructure:

| Reference project | What we borrow |
| --- | --- |
| GloBI (Global Biotic Interactions) | Directed, sourced interaction records as the core object; interaction types as vocabularies; CSV-style data releases |
| GBIF | Taxon backbone concepts, name usage vs. verbatim name separation, stable identifiers, citation of every record |
| iNaturalist | Observer/provenance-friendly record flow, clear data-quality labels shown next to every claim |
| Catalogue of Life (+ Species 2000 China Node) | Accepted/synonym name handling; reconciliation as a reviewable workflow, never silent rewriting |
| Encyclopedia of Life | Taxon-centric portals that remain network-aware (who interacts with whom) |
| WoRMS / POWO | Discipline-specific accepted-name registers; per-taxon external identifiers (`external_source` + `external_taxon_id`) |
| Open Tree of Life | Future phylogenetic layer: store trees/origin inferences separately from observational records |
| NSII 国家标本平台 | Chinese specimen-portal presentation: faceted browsing over specimen/record tables |
| eFlora / Flora of China | Multi-lineage portal layout: description + data + literature on one taxon page |

## Iteration plan — overnight session 2026-09-05 (completed)

1. ✅ **docs/** — DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY, ROADMAP; README full structure
2. ✅ **Scientific schema (PHASE 3)** — migration 002 (see `docs/DATABASE_SCHEMA.md`)
3. ✅ **Portal completion (PHASE 4)** — models/mimics/references/search, sortable persistent-filter explorer, homepage SVG network
4. ✅ **Data pipeline (PHASE 6, §53–54)** — validate/export/release scripts + workflow, generated seed
5. ✅ **Test hardening (PHASE 8)** — 17 tests incl. duplicate policy, CSV, vocab, seed sync, query API; a11y audit clean
6. ✅ **Stretch** — curator dashboard static prototype, CSV import pre-check, documented query patterns

## Beyond MVP (not scheduled)

- Live Supabase adapter (needs project credentials; adapter interface already in place)
- Curator UI with Supabase Auth + role-based RLS
- LLM literature-mining pipeline writing into the candidate inbox
- Phylogenetic distance / independent-origin analyses (separate inference layer)
- Zenodo DOI archival of data releases
- Full Tree-of-Life visualization
