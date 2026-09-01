# MimicryDB

## Who mimics whom across the Tree of Life?

MimicryDB is an alpha prototype for a provenance-first database of directional mimic → model | receiver interactions across animals, plants, fungi, and other lineages.

## Project status

Alpha / prototype. The public site currently uses explicitly labeled sample data. It is not a complete database and does not make scientific claims from the samples.

## Architecture

Astro + TypeScript static frontend, deployable to GitHub Pages under `/MimicryDB/`. A normalized PostgreSQL/Supabase schema is provided in `supabase/migrations/`; a data-provider abstraction can connect live data later without changing the UI.

The schema separates taxa, interactions, references, evidence, and audit history. Workflow status (`candidate` to `published`) is separate from knowledge status (`reported`, `supported`, `inferred`).

## Development

`npm install && npm run dev` · `npm run check` · `npm test` · `npm run build`

## Data and curation

See `docs/` for evidence, taxonomy, provenance, releases, and curation policies. Contributions must include mimic, model, reference, and evidence; external contributors cannot publish records directly.

## License

Software: MIT. Scientific database licensing remains a documented project decision before the first production release.
