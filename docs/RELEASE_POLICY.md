# Release policy

## Live database + frozen releases

The live database changes continuously; scientific publications need frozen, citable datasets. MimicryDB therefore separates the two and issues versioned releases:

- **MimicryDB v0.1.0, v0.2.0 … v1.0.0** — immutable snapshots.

## Release contents

Each data release contains:

- `interactions.csv`
- `taxa.csv`
- `references.csv`
- `evidence.csv`
- `interaction_references.csv`
- `controlled_vocabularies.csv` / `.json`
- `metadata.json` — export date, MimicryDB version, schema version, record counts, citation information
- checksums (`SHA256SUMS.txt`)
- `README.md` for the release

## Distribution

- **Now:** GitHub Releases, produced by `npm run release:data` / `.github/workflows/release-data.yml` (manual version input). Until a live database exists, release tooling is real infrastructure validated against the demo dataset — the demo dataset is always labeled DEMO and releases derived from it state so in `metadata.json`.
- **Later:** Zenodo archival with a data DOI (placeholder documented in README/Citation; not required for MVP).

## Citation

Data releases and the portal must be cited as: MimicryDB contributors, *MimicryDB: a database of mimic–model interactions across the Tree of Life*, release version X.Y.Z, URL. A formal citation/DOI block will be added with the first archived release.

## Licensing — open decision

- Software: MIT.
- Database content: **not yet decided**. Candidates are CC BY 4.0 (attribution required, maximum reuse) and CC0 (public domain). This is a documented project decision requiring confirmation before the first production release; it must not be made silently.
