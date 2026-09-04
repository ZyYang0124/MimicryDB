# Taxonomy policy

## Names in, names stored

MimicryDB stores what the source publication said, and what the current accepted name is, as two separate facts:

- `taxon.name_verbatim` — exactly as printed in the source (required; never rewritten).
- `taxon.scientific_name` / `canonical_name` / `accepted_name` — the name MimicryDB treats as current.
- `taxon_synonym` (migration 002+) preserves historical combinations with their type and source.

Historical names are never silently replaced. A record citing *Atta fugax* keeps that verbatim name even after the taxon is reconciled to *Myia fugax* or another accepted combination.

## Partial identification is first-class

Models and mimics are frequently not identified to species. The schema supports:

- any rank (species, genus, family, order, class, phylum, kingdom),
- unresolved taxa, `sp.`, `cf.`, `aff.`, and unidentified higher taxa,
- `model_resolution` on every interaction (species / genus / family / order / higher taxon / functional model class / unknown).

Lower-resolution literature records are kept, not discarded — downstream analyses choose the resolution they need.

## External reconciliation

Future reconciliation targets: Catalogue of Life (+ CoL China), GBIF, WoRMS, POWO, NCBI Taxonomy, Open Tree of Life. Reconciliation stores `external_source` + `external_taxon_id` on the taxon row.

Reconciliation is **always reviewable**: the MVP performs no automatic synonym correction, and batch reconciliation proposals enter the curation workflow like any other change (with audit entries).

## Kingdom scope

The schema is taxonomically general. Interactions are representable across Animalia, Plantae, Fungi, and other lineages in any direction (e.g. Plantae → Animalia, Fungi → Plantae). Kingdoms are recorded on the taxon and surfaced as `mimic kingdom → model kingdom`.
