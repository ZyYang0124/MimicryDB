# Contributing

MimicryDB is a curated scientific database. External contributors **cannot publish records directly** — suggestions are reviewed by curators before anything becomes public.

## Suggesting a record

Use the ["Suggest a mimicry interaction"](https://github.com/ZyYang0124/MimicryDB/issues/new?template=suggest-interaction.md) issue template. Minimum required information:

1. **Mimic** — taxon name as printed in the source (any resolution: species, genus, higher taxon, `sp.`/`cf.`)
2. **Model** — taxon or functional model class, with the resolution at which it is identified
3. **Reference** — DOI or complete citation
4. **Evidence** — the exact passage from the source, with page/section/figure
5. Proposed **evidence grade** (E0–E4, see `docs/EVIDENCE_GUIDELINES.md`) and your reasoning

Corrections to existing records and taxonomic issues have their own templates; taxonomic corrections never overwrite verbatim source names (`docs/TAXONOMY_POLICY.md`).

## Principles

- Reported resemblance ≠ experimentally demonstrated mimicry — the evidence grade must reflect the source honestly.
- Code contributions: run `npm run check && npm test && npm run build`; see the PR template. CI failures block merges.
- Never commit secrets; demo/sample data must stay clearly labeled (`CONTRIBUTING` applies to curation too: nothing is published without curator review).

## Curation workflow

`candidate → draft → needs_review → reviewed → published` — full description in `docs/CURATION_GUIDE.md`. Every accepted record keeps an audit trail of who changed what, when, and why.
