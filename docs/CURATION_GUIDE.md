# Curation guide

MimicryDB is a curated database. Everything published passes a human workflow; nothing becomes public automatically.

## Roles

| Role | Can do |
| --- | --- |
| Public | Browse, search, filter, download published data |
| Curator | Create/edit taxa, candidate interactions, drafts, references, evidence; submit for review |
| Reviewer | Everything a curator can, plus mark records *reviewed* and approve them |
| Admin | Publish, withdraw, manage users, controlled vocabularies, releases |

External contributors cannot publish records directly. Suggestions enter through issues/PRs or the candidate inbox and are vetted by curators.

## Workflow states

```
candidate → draft → needs_review → reviewed → published
                                      ↘ rejected / disputed / withdrawn
```

- **candidate** — entered from a suggestion, CSV import, or LLM extraction. Never publicly visible.
- **draft** — minimum required fields present (mimic, model, reference, evidence).
- **needs_review** — curator considers the record complete.
- **reviewed** — a reviewer has checked taxonomy, provenance and evidence grade.
- **published** — an admin has made the record public. Rejected/withdrawn records stay in the internal provenance system.

## Minimum required information

A record cannot leave *draft* without:

1. Mimic (taxon, at any resolution including `sp.`/`cf.`/higher taxon)
2. Model (taxon or functional model class + `model_resolution`)
3. At least one reference (DOI or complete citation)
4. At least one evidence passage with a locator (page/section/figure)
5. Evidence grade `E0`–`E4` with a written reason

## Evidence grading

Grades follow `docs/EVIDENCE_GUIDELINES.md`. Curators assign grades after reading the passage, never by keyword matching; the grade reason is mandatory. Reporting a resemblance (E0/E1) is not equivalent to demonstrated mimicry (E3/E4) — records must not be upgraded to look stronger than their sources.

## Duplicate handling

The pair `mimic_taxon_id + model_taxon_id` is **not** unique. The same pair may legitimately occur with different receivers, life stages, sexes, modalities, geographic contexts or mechanisms. Before saving, the curation interface shows potential duplicates and lets the curator link, merge, keep separate, or cancel.

## Revision discipline

Every edit that changes scientific content writes an `audit_log` row: old value, new value, who, when, why, and a supporting reference if applicable. Taxonomic corrections are updates, not overwrites — `name_verbatim` from the source publication is preserved.

## Reference import via Crossref (v0.5 groundwork)

Paste a DOI — never hand-type bibliographic metadata:

    npm run resolve:crossref -- 10.1126/science.176.4037.936
    npm run resolve:crossref -- --find "Mullerian mimicry Heliconius"

The importer queries the public Crossref REST API and writes verbatim metadata
(title, authors, year, journal, volume/issue/pages, ISSN, publisher, license,
abstract, plus the full raw record) to data/reconciliation/crossref.json.
That report is a **reviewable inbox**: it never modifies the dataset directly.
Reference rows enter the database only after a curator confirms them
(candidate -> review -> published), and every record keeps a
crossref_verified_at timestamp for provenance. JATS tags are stripped from
titles/abstracts; the raw Crossref payload is preserved alongside.

## The /curator/ workbench (v0.6.0)

Three queues, one export:

1. **Interaction candidates** (data/curation/interaction-candidates.json) — Accept (publish-ready, review_status=reviewed) / Reject (reason required, stays internal) / Needs expert (second reviewer, SOP Phase 16). Field edits overwrite the proposal; originals survive in the audit log.
2. **Literature screening queue** (data/harvest/candidates.json) — likely_relevant / maybe_relevant / irrelevant. Irrelevant requires an exclusion reason and is never deleted (SOP Phase 10).
3. **Reference confirmations** (data/reconciliation/crossref.json) — confirm the Crossref metadata is the right paper.

Workflow: record decisions in the browser (persisted locally), Export decisions,
then apply:

    npm run curation:apply -- curation-decisions-2026-09-06.json

The apply script validates the file (curator name required; irrelevant needs a
reason), writes the layer updates, and appends every action to
data/curation/audit-log.jsonl — the audit trail is the product.
