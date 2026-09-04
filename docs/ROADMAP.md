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

## Iteration plan — overnight session 2026-09-05

1. **docs/** — DATA_DICTIONARY, CURATION_GUIDE, TAXONOMY_POLICY, LLM_EXTRACTION_POLICY, RELEASE_POLICY; expand README to the full scientific structure.
2. **Scientific schema (PHASE 3)** — migration 002: taxon hierarchy fields, `taxon_synonym`, `biological_entity`, controlled vocabularies (`mimicry_type`, `signal_modality`, `receiver_role`) with M2M joins, `interaction_reference` M2M, `interaction_geography`, `candidate` (LLM extraction metadata), `evolutionary_origin`, indexes, expanded RLS; TS types + provider alignment.
3. **Portal completion (PHASE 4)** — `/models/`, `/mimics/`, `/references/` (+ detail), global search, sortable/persistently-filtered interaction table, homepage directed network visualization (inline SVG).
4. **Data pipeline (PHASE 6, §53–54)** — `scripts/` export-data (CSV set + metadata + checksums), validate-data wired into CI, release-data scaffolding + workflow (real infrastructure only; no fabricated exports).
5. **Test hardening (PHASE 8)** — validation, duplicate detection, filtering, CSV export tests; a11y pass.
6. **Stretch** — curator dashboard static prototype (`/curator/`, demo only).

## Beyond MVP (not scheduled)

- Live Supabase adapter (needs project credentials; adapter interface already in place)
- Curator UI with Supabase Auth + role-based RLS
- LLM literature-mining pipeline writing into the candidate inbox
- Phylogenetic distance / independent-origin analyses (separate inference layer)
- Zenodo DOI archival of data releases
- Full Tree-of-Life visualization
