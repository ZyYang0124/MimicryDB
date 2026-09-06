# Database schema

PostgreSQL migrations live in `supabase/migrations/`; `supabase/seed.sql` is generated from the demo dataset by `npm run generate:seed`. Field-level detail: [docs/DATA_DICTIONARY.md](DATA_DICTIONARY.md).

## Migration 001 — initial prototype

- `taxon` — scientific/canonical/verbatim names, rank, kingdom, self-referencing `parent_taxon_id`, taxonomic status
- `reference` — DOI, title, authors, year, journal, URL, citation text
- `mimicry_interaction` — the core table: stable `public_id` (`MIMICRY:NNNNNN`), `mimic_taxon_id` → `model_taxon_id`, receiver description, workflow `interaction_status` (`candidate` → … → `published`), scientific `knowledge_status` (`reported`/`supported`/`inferred`), `evidence_grade` (E0–E4) + reason, summary, `model_resolution`, confidence
- `evidence` — passage-level provenance: interaction + reference + quoted text + page/section/figure + grade + `source_method`
- `audit_log` — old/new JSONB snapshots, actor, reason, timestamp
- RLS enabled; anonymous read only for `interaction_status = 'published'`

## Migration 002 — scientific schema (PHASE 3)

- `taxon` extended: `accepted_name`, `authorship`, phylum → species hierarchy, `external_source` + `external_taxon_id`, `taxonomic_resolution`, notes
- `taxon_synonym` — historical combinations preserved with type and source
- `biological_entity` — life stage / sex / anatomical structure / signal for mimic-side and model-side specificity (e.g. *plant structure → butterfly egg*)
- `vocabulary_term` + joins — controlled vocabularies `mimicry_type`, `signal_modality`, `receiver_role`; interactions relate M2M via `interaction_mimicry_type` / `interaction_signal_modality`
- `mimicry_interaction` extended: `mimic_entity_id`, `model_entity_id`, `receiver_taxon_id`, `receiver_resolution`, `specific_model_identified`, `geographic_overlap_status`, curator/review fields and timestamps
- `interaction_reference` — M2M between interactions and references
- `interaction_geography` — country/region/locality, coordinates, sympatry status (no GIS yet; GBIF/iNaturalist-ready)
- `candidate` — LLM extraction inbox: proposed fields + extraction model/prompt version/timestamp/confidence/raw JSON + review status; candidates can never auto-publish
- `evolutionary_origin` + `interaction_origin` — inference-layer origins with `ORIGIN:NNNNNN` public IDs, kept strictly separate from observational records
- Indexes on `mimic_taxon_id`, `model_taxon_id`, `interaction_status`, `evidence_grade`, `public_id`, `doi`, `scientific_name`
- RLS: vocabularies/synonyms/entities/origins publicly readable; interaction-scoped rows public only when the parent interaction is published; candidates never public

## Migration 003 — model_kind axis

- `mimicry_interaction.model_kind` — orthogonal to mimicry type: `organism | environment | object | self | unknown | other`. The model side may be an inanimate object or an environment rather than a taxon; kingdom-flow constraints keep the two representations consistent.

## Migration 004 — claim-level citation, media assets, vernacular names

- `interaction_reference.claim_roles text[]` + `interaction_reference.locator` — AntWeb/AntCat-style claim-level citation: each linked source states which assertions it supports (`claim_role` vocabulary: mimic-resemblance, model-identity, receiver-response, mechanism, distribution, taxonomy) and optionally where (page/figure).
- `mimicry_interaction.observed_on date` + `recorded_by text` — record-level observation metadata (xeno-canto pattern). NULL in demo data: dates/recorders are never invented.
- `taxon_image` — specimen-first media assets with stable public IDs (`IMG-nnnn`, mirroring `data/images.json`), mandatory license/artist attribution, `life_stage` only when a source states it.
- `taxon_vernacular` — display-only common names (language, preferred flag, source); the verbatim scientific name always stays canonical.

## Migration 005 — core data layer stabilization (v0.3)

The ten-object layer of the v1.0 product definition (docs/ROADMAP.md). All changes additive.

- `entity` — generalizes `biological_entity`: any participant in a mimicry system, taxon or not (`entity_type`: taxon, organism, sex, life_stage, anatomical_structure, signal, environmental_object, biological_material, functional_class, unresolved), with `parent_entity_id` composition. `biological_entity` is retained and will be migrated in v0.4.
- `taxon_external_identifier` — many identifiers per taxon (GBIF, CoL, NCBI, OpenTree, WoRMS, POWO, Wikidata…): a taxon is a name usage that can live in several authorities; `external_source`/`external_taxon_id` on taxon are superseded (kept until the v0.4 data migration). Seeded from the GBIF reconciliation report with the same exact-match guard as the vernacular names.
- `mimicry_system` + `system_interaction` — optional grouping layer above atomic interactions: Müllerian rings, species complexes, polymorphic systems (`SYSTEM:NNNNNN` public IDs). The directed edge remains the only scientific record.
- `evidence_support` — upgrades the E0–E4 grade with dimensions: each evidence passage may support/contradict per `evidence_dimension` (resemblance, model_identity, receiver_identity, receiver_perception, receiver_response, fitness_consequence, geographic_overlap, temporal_overlap, mechanism, signal_characterization) with `support_direction` (supports, contradicts, mixed, uncertain). Contradictory evidence is a first-class citizen.
- `vocabulary_term` extended: stable `public_id` (`TERM:<VOCABULARY>:<TERM>`), `parent_term`, `synonyms`, inclusion/exclusion criteria, `status`, `version` — the ontology becomes citable and versioned (docs/ONTOLOGY.md).
- `reference` extended: volume, issue, pages, issn, publisher, license, reference_type, `crossref_metadata` jsonb + `crossref_verified_at` — DOI-first curation via the Crossref REST API.
- `contributor` + `contribution` — community curators get a citable identity (name, ORCID, affiliation, role) and per-record contribution credit (interaction, evidence, taxonomy, reference, review, correction).
- RLS: entities/identifiers/evidence support/contributors/contributions publicly readable; system rows public only when at least one member interaction is published.

## Design rules

Publication ≠ interaction ≠ taxon pair ≠ independent evolutionary origin; observation ≠ evaluation ≠ inference. Same taxon pairs may recur with different receivers/stages/contexts (no global uniqueness). Uncertainty is representable (`unknown`, `unresolved`, `sp.`/`cf.`/`aff.`). See `prompt.md` §13–28 for the full scientific rationale.
