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

## Design rules

Publication ≠ interaction ≠ taxon pair ≠ independent evolutionary origin; observation ≠ evaluation ≠ inference. Same taxon pairs may recur with different receivers/stages/contexts (no global uniqueness). Uncertainty is representable (`unknown`, `unresolved`, `sp.`/`cf.`/`aff.`). See `prompt.md` §13–28 for the full scientific rationale.
