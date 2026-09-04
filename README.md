# MimicryDB

## Who mimics whom across the Tree of Life?

An open database of documented **mimic → model | receiver** interactions across animals, plants, fungi, and other lineages — designed as durable scientific infrastructure, not a species catalogue.

## Project status

**Alpha / prototype (v0.2.0).** The public site currently serves explicitly labeled sample data (`DEMO / PROTOTYPE DATA`). It is not a complete database and makes no scientific claims from the samples. The normalized PostgreSQL/Supabase schema and curation workflow are under active development.

## Scientific motivation

Mimicry is a directional interaction between signal producer and receiver, and one of evolution's clearest examples of convergent adaptation. The records are scattered across thousands of publications in different languages and communities, making cross-lineage synthesis — where mimicry concentrates on the Tree of Life, which lineages repeatedly evolve it, which models are repeatedly imitated, how often it crosses kingdom boundaries — practically impossible today. MimicryDB aims to make these questions answerable.

## What is a mimicry interaction?

The fundamental record is a **directed interaction**, not a species:

```
Mimic → Model | Receiver
```

- **Mimic** — organism or biological structure producing the mimetic signal
- **Model** — organism, structure, life stage, or signal being imitated
- **Receiver** — organism whose perception or behavior makes the mimicry biologically meaningful

Example: *Ophrys apifera* → female bee | male bee (sexual deception).

The architecture keeps four concepts strictly separate: **Publication ≠ Interaction ≠ Taxon pair ≠ Independent evolutionary origin**, and three knowledge layers: observation ≠ evaluation ≠ inference (`reported` / `supported` / `inferred`).

## Data model

Normalized PostgreSQL (Supabase) schema: `taxon`, `reference`, `mimicry_interaction`, `evidence`, `audit_log` — with controlled vocabularies, many-to-many relations, stable public IDs (`MIMICRY:000001`), row-level security limited to published records, and a full audit trail (`docs/DATA_DICTIONARY.md`). The frontend talks to a `DataProvider` abstraction (`src/data/provider.ts`): a typed demo adapter today, a live Supabase adapter later, with no UI changes. See `docs/ARCHITECTURE.md`.

## Evidence grading

Every record carries an evidence grade with a written justification:

| Grade | Meaning |
| --- | --- |
| E0 | resemblance terminology only |
| E1 | explicit author proposal |
| E2 | ecological / geographic / behavioral support |
| E3 | quantitative or experimental resemblance or receiver response |
| E4 | direct experimental biological outcome |

Details: `docs/EVIDENCE_GUIDELINES.md`. Reported resemblance is not equivalent to demonstrated mimicry, and grades are never assigned by keywords alone.

## Features (current prototype)

- Interaction explorer with search and type/evidence-grade filters
- Interaction detail pages with provenance sections
- Taxon index and per-taxon network pages (as mimic / as model)
- Evidence framework page, data downloads (CSV/JSON)
- Real validation tests over the dataset (`npm test`)

## Public portal

https://zyyang0124.github.io/MimicryDB/ (GitHub Pages; deployed from `main` via GitHub Actions).

## Data access

Download page on the portal (`/download/`) exports the current demo dataset as CSV/JSON. No authentication is required to download published data.

## Data releases

Versioned, frozen releases (CSV set + metadata + checksums) are distributed via GitHub Releases; Zenodo/DOI archival is planned — see `docs/RELEASE_POLICY.md`.

## Curation

Records move through `candidate → draft → needs_review → reviewed → published`; external contributors cannot publish directly. See `docs/CURATION_GUIDE.md`.

## Development

```bash
npm install
npm run dev      # local dev server
npm run check    # astro check (type checking)
npm test         # node:test over the dataset
npm run build    # production build (base path /MimicryDB/)
```

## Testing

`node:test` suites validate the dataset (stable unique IDs, required fields, evidence grades, directionality, kingdom flow) and the data provider. `astro check` and a production build gate every push in CI.

## Deployment

GitHub Actions (`.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`) build and deploy the Astro static site to GitHub Pages under `/MimicryDB/`. Static hosting constraint: the public portal must remain statically deployable; live data joins later through the Supabase client, never a self-hosted server.

## Contributing

Suggest records with a mimic, model, complete citation or DOI, and evidence (`CONTRIBUTING.md`). Issue templates cover interaction suggestions, record corrections, and taxonomic issues. Reported resemblance ≠ experimentally demonstrated mimicry.

## Citation

MimicryDB contributors, *MimicryDB: a database of mimic–model interactions across the Tree of Life*, release vX.Y.Z, https://github.com/ZyYang0124/MimicryDB. A formal DOI block will be added with the first archived data release.

## License

Software: MIT. Scientific database licensing (CC BY 4.0 vs CC0) remains a documented open decision before the first production release (`docs/RELEASE_POLICY.md`).

## Contact / maintainers

Maintained by [ZyYang0124](https://github.com/ZyYang0124). Repository: https://github.com/ZyYang0124/MimicryDB
