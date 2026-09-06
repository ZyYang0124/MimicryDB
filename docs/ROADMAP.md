# MimicryDB Roadmap

Project status: **v0.3 — schema stabilization** (static prototype with labeled demo data). See `prompt.md` for the original project specification and `docs/EVIDENCE_GUIDELINES.md` for the evidence framework.

## Product definition (v1.0)

> **MimicryDB is an evidence-aware, interaction-centered, community-curated knowledge base of mimicry systems across the Tree of Life.**

This is an architectural constraint, not a slogan:

- **interaction-centered** — the atomic data unit is always the directed interaction (mimic → model | receiver), never the species.
- **evidence-aware** — every scientific judgement traces to evidence: passage + locator + per-dimension support direction.
- **community-curated** — anyone may submit, correct, or add evidence; nothing changes `published` data without curator review (candidate → review → published).
- **knowledge base** — the database stores sources, terms, taxonomy, disputes, history and relations, not just results.
- **across the Tree of Life** — the data model is never hardcoded to "animal mimics animal" (`entity` abstraction, kingdom flows, model kinds).

## Phase plan

### v0.3 — Schema stabilization *(current, in progress)*

- [x] `entity` abstraction (generalizes `biological_entity`; models may be objects/signals) — migration 005
- [x] `taxon_external_identifier` (many authorities per taxon: GBIF/CoL/NCBI/OpenTree/WoRMS/POWO/Wikidata) — migration 005, seeded from the GBIF reconciliation report
- [x] `mimicry_system` + `system_interaction` grouping layer (`SYSTEM:NNNNNN`) — migration 005
- [x] Evidence dimensions: `evidence_support` (10 dimensions × supports/contradicts/mixed/uncertain) — migration 005
- [x] Ontology versioning: `vocabulary_term` stable IDs, hierarchy, criteria, status, version — migration 005 + `docs/ONTOLOGY.md`
- [x] Crossref-ready `reference` metadata — migration 005
- [x] `contributor` + `contribution` model — migration 005
- [x] Docs: `DATABASE_SCHEMA.md` (003/004/005), `DATA_DICTIONARY.md` drift fixed, `ONTOLOGY.md` created, this roadmap rewritten

### v0.4 — Live database

Supabase production project; `DataProvider` swaps to a Supabase adapter (the documented query patterns already define the contract); data migration `biological_entity` → `entity` and `external_source` → `taxon_external_identifier`; RLS policies live; auth for curators; public read API. The static GitHub Pages frontend stays.

### v0.5 — Curator platform *(groundwork started)*

- [x] Crossref DOI importer (`npm run resolve:crossref`): DOI / bibliographic search → verbatim metadata into the reviewable inbox `data/reconciliation/crossref.json` (docs/CURATION_GUIDE.md)

Login; candidate inbox UI; record editor; DOI-first reference importer (Crossref REST lookup → curator confirms); taxonomy reconciliation queue; evidence editor with per-dimension support; review & publish flow; audit history view.

### v0.6 — Community submission

Public submit interaction / suggest correction / add reference / add evidence forms — all landing in the candidate layer; external contributors may never update published rows directly.

### v0.7 — Research portal

Taxon pages become research portals (roles, models, modalities, evidence profile, geography, related systems, external databases); reference pages become bibliographic hubs (supported interactions, taxa, evidence, extraction provenance); system pages for rings/complexes; faceted advanced search (taxon, lineage, type, modality, receiver role, evidence grade + dimension, geography, year, knowledge status, resolution, cross-kingdom) with "download these N interactions".

### v0.8 — Interoperability

Crossref enrichment live; GBIF/CoL/OpenTree identifier sync; GloBI-compatible export; JSON API; machine-readable schema (`schema.json`).

### v0.9 — Scientific beta

200–500 hand-curated gold-standard interactions to stress-test the schema — covering animals/plants/fungi, intra- and cross-kingdom, visual/chemical/acoustic, Batesian/Müllerian/aggressive/reproductive/masquerade, strong/weak/disputed evidence.

### v1.0 — First public scientific release

Schema frozen; ontology versioned; curation and public contribution working; stable API/exports; documentation complete; frozen release sets (interactions/taxa/entities/references/evidence/vocabularies CSV + README + schema.json + CHANGELOG + checksums.txt) published via GitHub Release → Zenodo DOI.

## SOP v1 development order (2026-09-06 review)

Priority order is fixed: Schema > Ontology > Provenance > Curation > Harvester > Search > Data quantity > Visualization > Macro-evolution analysis. Harvester MVP comes **before** any demo-data expansion. Full SOP: see the 2026-09-06 development SOP (40 phases, per-version DoD).

| Version | Content | Status |
|---|---|---|
| 0.3.0 | Core schema stabilization | ✅ (migration 005) |
| 0.3.1 | Ontology + Evidence | ✅ (ontology v1.1 hierarchical + defined; evidence_support dimensions × direction × strength; migration 006) |
| 0.3.2 | Reference + Taxonomy normalization | ✅ (Crossref-shaped reference columns + importer groundwork; GBIF external identifiers + reconciliation guards) |
| 0.4.0 | Live Supabase DB | ◻ needs Supabase project credentials |
| 0.4.1 | Harvester: Crossref | ✅ MVP (docs/HARVESTER.md; profile-driven, dedupe ladder, run provenance, fixture-tested) |
| 0.4.2 | Harvester: OpenAlex | ✅ (profile + inverted-index abstract reconstruction + cross-source dedupe) |
| 0.4.3 | Candidate corpus + dedupe | ✅ corpus + full ladder (DOI exact / normalized title / fuzzy-title flag for review) |
| 0.5.0 | LLM screening | ◻ |
| 0.5.1 | OA/fulltext resolver | ◻ |
| 0.5.2 | LLM extraction | ◻ |
| 0.6.0 | Curator UI | ✅ first pass (/curator/ workbench: interaction candidates, literature screening, reference confirmations, export → curation:apply with audit trail) |
| 0.6.1 | Publish pipeline | ◻ |
| 0.7.0 | Advanced search | ◻ (basic filter+export live on the download page) |
| 0.7.1 | Taxon/reference/system portal | ✅ first pass (research-portal taxon pages, reference hubs, /systems pages) |
| 0.8.0 | Community contribution | ◻ |
| 0.8.1 | Public API | ◻ |
| 0.9.0 | Gold-standard scientific beta | ◻ |
| 1.0.0 | First scientific release + DOI | ◻ |

## Design references

MimicryDB borrows interaction-model and portal patterns from established biodiversity infrastructure:

| Reference project | What we borrow |
| --- | --- |
| GloBI (Global Biotic Interactions) | Directed, sourced interaction records as the core object; interaction types as vocabularies; CSV-style data releases |
| GBIF | Taxon backbone concepts, name usage vs. verbatim name separation, stable identifiers, citation of every record |
| iNaturalist | Observer/provenance-friendly record flow, clear data-quality labels shown next to every claim |
| Catalogue of Life (+ Species 2000 China Node) | Accepted/synonym name handling; reconciliation as a reviewable workflow, never silent rewriting |
| Encyclopedia of Life | Taxon-centric portals that remain network-aware (who interacts with whom) |
| WoRMS / POWO | Discipline-specific accepted-name registers; per-taxon external identifiers (`taxon_external_identifier`) |
| Open Tree of Life | Future phylogenetic layer: store trees/origin inferences separately from observational records |
| NSII 国家标本平台 | Chinese specimen-portal presentation: faceted browsing over specimen/record tables |
| eFlora / Flora of China | Multi-lineage portal layout: description + data + literature on one taxon page |
| AntWeb / AntCat | Claim + locator citations, specimen-first media assets, caste/life-stage dimension |
| xeno-canto | Record-level observation metadata, quality grading A–E ↔ E0–E4, community correction flow |

## Archive — earlier iterations (completed)

- **Overnight session 2026-09-05**: docs/ scaffold; migration 002 scientific schema; portal completion (models/mimics/references/search, sortable persistent-filter explorer); data pipeline (validate/export/release); test hardening; curator dashboard prototype.
- **Post-session iterations**: Hasselblad dark design + photo hero; bilingual site; GBIF alignment + Chinese common names; claim-level citations; media asset IDs; filterable download with CC BY 4.0; directed mimicry network with clustering, hover labels and click-to-highlight (migration 003 model_kind; migration 004 taxon_image/taxon_vernacular).

## Beyond the phase plan (not scheduled)

- LLM literature-mining pipeline writing into the candidate inbox
- Phylogenetic distance / independent-origin analyses (separate inference layer)
- Full Tree-of-Life visualization
