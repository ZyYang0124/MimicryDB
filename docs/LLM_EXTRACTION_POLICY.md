# LLM extraction policy

MimicryDB is designed for large-scale LLM-assisted literature mining, but **LLM output is candidate data, never scientific truth**.

## Pipeline position

```
Literature corpus
  → LLM abstract screening
  → LLM relation extraction
  → Candidate records (candidate inbox)
  → Human curator
  → Reviewed interaction
  → Published database
```

A candidate must never directly become `published` without human curation. The RLS policy additionally hides everything that is not `published` from anonymous readers.

## What every candidate must store (reproducibility)

- proposed mimic / model / receiver
- proposed mimicry type and signal modality
- proposed evidence grade + evidence passage + reference
- extraction confidence
- extraction model (and model version)
- extraction prompt version
- extraction timestamp
- raw extraction JSON

These fields make an extraction rerunnable and auditable years later.

## Curator actions on candidates

Accept → creates a `candidate` interaction (still unpublished). Edit → corrects fields, keeps the raw extraction untouched. Reject → keeps the candidate in the inbox with the rejection reason. Needs review → flags ambiguous extractions for a second pass.

## Honesty rules for evidence

- LLM-extracted evidence rows carry `source_method = 'LLM extraction'` and can never silently upgrade a record's evidence grade.
- Fabricated passages, DOIs, or page numbers found during review cause rejection of the whole candidate and a note in the audit log.
- Screening/rejection statistics must never be presented as curated database content.
