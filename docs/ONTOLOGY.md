# MimicryDB ontology

MimicryDB's controlled vocabularies are a citable, versioned component of the database — not hidden strings in SQL. This follows FAIR principles: terms are discoverable, carry stable identifiers, and are versioned.

## Source of truth

`data/controlled-vocabularies.json` is the single source of truth. It is seeded into the `vocabulary_term` table by `npm run generate:seed`, and validated on every build (`npm run validate:data`, test suite).

## Stable identifiers

Every term receives a public identifier of the form:

```
TERM:<VOCABULARY>:<TERM>
```

Examples:

- `TERM:MIMICRY_TYPE:BATESIAN` — Batesian mimicry
- `TERM:SIGNAL_MODALITY:CHEMICAL` — chemical signal
- `TERM:EVIDENCE_DIMENSION:FITNESS_CONSEQUENCE` — fitness consequence
- `TERM:ENTITY_TYPE:ENVIRONMENTAL_OBJECT` — environmental object (bird dropping, twig, dead leaf)

Future URLs will follow `/ontology/<vocabulary>/<term>/` (e.g. `/ontology/mimicry-type/batesian/`), resolving to the term's definition, hierarchy, criteria and references.

## Versioning policy

- Current ontology version: **1.0.0** (v0.3 schema stabilization).
- **Adding** a term or synonym → minor version bump (1.1.0).
- **Changing a term's meaning, parent, or retiring it** → major version bump (2.0.0); terms are never deleted, only `status: deprecated` (with a `parent_term`/notes pointer to the replacement).
- Every term carries `status` (`accepted` / `deprecated`) and `version` in `vocabulary_term`.
- Vocabulary changes are proposed via a GitHub issue, reviewed by a curator, and recorded in the release changelog.

## Term anatomy

Each term may carry: `label`, `definition`, `parent_term` (hierarchy), `synonyms`, `inclusion_criteria`, `exclusion_criteria`, `source_references`, `status`, `version`.

## Current vocabularies (ontology v1.0.0)

| Vocabulary | Terms | Purpose |
| --- | --- | --- |
| `mimicry_type` | Batesian, Müllerian, aggressive, reproductive, sexual deception, brood, egg, social, parasitic, floral, food deception, protective, automimicry, masquerade, … + `uncertain` / `mixed` / `other` | What kind of mimicry the record describes |
| `signal_modality` | visual, chemical, acoustic, vibrational, tactile, electrical, multimodal, unknown, … | Which signal channel carries the deception |
| `receiver_role` | predator, prey, pollinator, mate, host, competitor, herbivore, parasitoid, other, unknown | Who is deceived |
| `model_kind` | organism, environment, object, self, unknown, other | What kind of thing the model side is (migration 003) |
| `evidence_grade` | E0–E4 | Overall evidence strength (docs/EVIDENCE_GUIDELINES.md) |
| `claim_role` | mimic-resemblance, model-identity, receiver-response, mechanism, distribution, taxonomy | Which assertion a citation supports (migration 004) |
| `entity_type` | taxon, organism, sex, life_stage, anatomical_structure, signal, environmental_object, biological_material, functional_class, unresolved | What kind of participant an `entity` row represents (migration 005) |
| `evidence_dimension` | resemblance, model_identity, receiver_identity, receiver_perception, receiver_response, fitness_consequence, geographic_overlap, temporal_overlap, mechanism, signal_characterization | The ten dimensions evidence can address (migration 005) |
| `support_direction` | supports, contradicts, mixed, uncertain | Direction of an evidence record per dimension — contradictory evidence is a first-class citizen (migration 005) |
| `system_type` | ring, complex, polymorphic, series, other | Kind of `mimicry_system` grouping (migration 005) |
| `model_resolution` | species, genus, family, higher_taxon, functional_group, object, signal, unknown | How precisely the model side is resolved (migration 005) |
| `interaction_status`, `knowledge_status` | workflow vocabularies | Curation pipeline state; scientific knowledge state |

## Hierarchy intent

`mimicry_type` is hierarchical (e.g. `Batesian` → parent `protective mimicry`; `masquerade` stands alone). Parent links are expressed through `parent_term` and will surface in the `/ontology/` pages. Curators must never be forced into a classification that does not exist: `uncertain`, `mixed` and `other` are always available.

## Interoperability note

MimicryDB keeps its native vocabulary because mimicry (mimic / model / receiver / signal / evidence) is not fully expressible in Darwin Core. Interoperability exports (GloBI-compatible, DwC-ish) are planned for v0.8 and will map MimicryDB terms to external ones where possible — mapping tables will live beside this document.
