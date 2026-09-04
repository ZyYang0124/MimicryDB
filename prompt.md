# MASTER DEVELOPMENT PROMPT — MimicryDB

You are acting as a senior full-stack engineer, scientific database architect, biodiversity informatics engineer, UX designer, DevOps engineer, and research software engineer.

Your task is to design, implement, test, document, version-control, and deploy a long-term open scientific database portal called:

# MimicryDB

## A global database of mimic–model interactions across the Tree of Life

The existing GitHub repository is:

https://github.com/ZyYang0124/MimicryDB.git

This repository ALREADY EXISTS.

DO NOT create a new repository.

Clone or use this exact repository, inspect its current state, preserve any useful existing content, and implement the project inside it.

The final public portal must be deployed using GitHub Pages.

The project must be designed as serious long-term scientific infrastructure, not a temporary demo website.

---

# 1. Scientific motivation

MimicryDB aims to systematically document mimicry relationships across the Tree of Life.

The central scientific objective is not merely to record whether a species exhibits mimicry.

The fundamental unit is a directional biological interaction:

Mimic → Model

When available:

Mimic → Model | Receiver

where:

- Mimic = organism or biological structure producing a mimetic signal
- Model = organism, structure, life stage, or biological signal being imitated
- Receiver = organism whose perception or behavior makes the mimicry biologically meaningful

Examples include:

ant-mimicking spider
→ ant
→ predator

orchid flower
→ female bee
→ male bee

harmless snake
→ coral snake
→ predator

plant structure
→ butterfly egg
→ ovipositing butterfly

hoverfly
→ wasp
→ predator

The database will eventually allow researchers to ask:

1. Where is mimicry concentrated across the Tree of Life?
2. Which evolutionary lineages repeatedly evolve mimicry?
3. Which organisms or clades are repeatedly used as models?
4. Which organisms are the most frequently mimicked?
5. Which lineages have independently evolved mimicry most often?
6. How phylogenetically distant are mimics and models?
7. How common are cross-kingdom mimicry relationships?
8. Are mimicry interactions directionally structured?
9. Does the global mimicry network contain hubs, modules, hotspots, or coldspots?
10. Are different mimicry mechanisms distributed differently across the Tree of Life?
11. What determines who can mimic whom?
12. What constrains the evolutionary accessibility of mimicry?

Therefore the database must be designed for future:

- macroevolutionary analyses
- phylogenetic comparative analyses
- network analyses
- biogeographic analyses
- literature mining
- LLM-assisted extraction
- data releases
- external API use

Do not design this as a simple species catalogue.

---

# 2. Core conceptual model

The primary scientific object is:

MimicryInteraction

not:

Species

The conceptual structure is:

Mimic
↓
Mimic Entity
↓
Mimicry Interaction
↓
Model Entity
↓
Model

optionally connected to:

Receiver

and supported by:

Reference
+
Evidence

A record should conceptually represent:

Mimic → Model | Receiver

---

# 3. Critical scientific distinctions

The database architecture MUST strictly distinguish:

## 3.1 Publication

A scientific publication.

Example:

Paper A

---

## 3.2 Interaction

A documented mimicry relationship.

Example:

Species A → Species B

---

## 3.3 Species/taxon pair

The taxonomic relationship:

Taxon A → Taxon B

Multiple interactions may involve the same taxon pair under different:

- life stages
- sexes
- locations
- receivers
- signals
- mechanisms

---

## 3.4 Independent evolutionary origin

A phylogenetically inferred evolutionary event.

Example:

50 species may belong to a single evolutionary origin of ant mimicry.

Therefore:

Publication
≠
Interaction
≠
Species pair
≠
Independent evolutionary origin

Do not merge these concepts.

---

# 4. Knowledge layers

The database must distinguish:

## Reported

A publication explicitly reports or proposes a mimicry relationship.

## Supported

The MimicryDB curatorial process evaluates the record as sufficiently supported according to evidence criteria.

## Inferred

A downstream scientific inference derived from phylogenetic, ecological, geographic, or statistical analysis.

Therefore:

Observation
≠
Evaluation
≠
Inference

Design the database accordingly.

---

# 5. Provenance principle

MimicryDB must follow:

# No claim without provenance.

Every scientifically meaningful interaction should be traceable to:

Interaction
→ Reference
→ Evidence passage

Evidence provenance should support:

- exact or paraphrased evidence passage
- source publication
- page
- section
- figure
- table
- supplementary material
- curator comment
- extraction source
- evidence quality

A researcher viewing a record should be able to determine:

“Why does MimicryDB say this relationship exists?”

---

# 6. Revision history

Scientific records must be versioned.

If a record changes from:

Model = Formicidae

to:

Model = Oecophylla smaragdina

the previous state must not disappear silently.

Record:

- old value
- new value
- who changed it
- when
- why
- supporting reference if applicable

Create a scientific audit trail.

---

# 7. Existing GitHub repository

Use this existing repository:

https://github.com/ZyYang0124/MimicryDB.git

First:

1. inspect repository state
2. inspect branch structure
3. inspect existing files
4. inspect Git history
5. check remotes
6. check GitHub authentication
7. preserve useful work
8. do not overwrite existing useful material without reason

Run:

git remote -v

and:

gh auth status

where possible.

Do NOT recreate the repository.

Do NOT change the repository owner.

Do NOT create a similarly named replacement repository.

The canonical repository is:

ZyYang0124/MimicryDB

---

# 8. Deployment requirement

The public website MUST deploy through GitHub Pages.

Expected URL:

https://zyyang0124.github.io/MimicryDB/

Do not invent or report this URL as successfully deployed until the actual GitHub Pages deployment succeeds.

The final task is not complete merely because the site builds locally.

Deployment must actually be attempted.

---

# 9. Important GitHub Pages constraint

GitHub Pages is static hosting.

Therefore GitHub Pages cannot directly host:

- PostgreSQL
- Node backend server
- Python backend
- PHP
- Next.js server runtime
- server actions
- private API server
- authentication server

The public frontend must therefore be statically deployable.

Recommended architecture:

GitHub
+
GitHub Actions
+
GitHub Pages
+
Supabase

---

# 10. Preferred technical architecture

Unless there is a compelling technical reason to change it, use:

## Frontend

Astro

TypeScript

Tailwind CSS

React components only where interactive behavior is useful

Possible visualization libraries:

- D3.js
- Cytoscape.js
- ECharts

Choose carefully and avoid unnecessary dependencies.

---

## Public hosting

GitHub Pages

---

## Source control

GitHub

Repository:

ZyYang0124/MimicryDB

---

## CI/CD

GitHub Actions

---

## Database

Supabase PostgreSQL

---

## Authentication

Supabase Auth

---

## Authorization

PostgreSQL Row Level Security

---

## Scientific data releases

GitHub Releases initially

Potential future Zenodo integration for DOI archival

---

# 11. Why Astro is preferred

This website is:

- mostly public scientific content
- static-shell friendly
- data driven
- suitable for GitHub Pages
- requires some interactive components
- should remain lightweight and maintainable

Astro is therefore preferred over server-dependent Next.js.

Do not choose Next.js unless static export is fully supported for every required public page and the complexity is justified.

---

# 12. GitHub Pages base path

This is a project Pages site.

Production base path is expected to be:

/MimicryDB/

All:

- routes
- scripts
- images
- assets
- stylesheets
- downloads
- JSON
- CSV
- visualization assets

must work correctly under the repository subpath.

Avoid the common failure where:

localhost works

but:

GitHub Pages returns asset 404s.

Configure Astro's:

site

and:

base

correctly.

---

# 13. Database design philosophy

Use normalized PostgreSQL relational tables.

Do NOT store the scientific database as one enormous JSON object.

Do NOT make the main application depend on hardcoded arrays.

Do NOT store every scientific concept in one table.

Use controlled vocabularies where scientifically appropriate.

Allow uncertainty and missing data.

---

# 14. Taxon entity

Create a Taxon model/table.

Minimum fields:

- id
- scientific_name
- canonical_name
- name_verbatim
- accepted_name
- authorship
- rank
- kingdom
- phylum
- class
- order_name
- family
- genus
- species
- parent_taxon_id
- taxonomic_status
- external_source
- external_taxon_id
- taxonomic_resolution
- notes
- created_at
- updated_at

The database must support:

- species
- genus
- family
- order
- class
- phylum
- kingdom
- unresolved taxon
- historical combination
- “sp.”
- “cf.”
- “aff.”
- unidentified higher taxon

Do not assume all models are known to species level.

---

# 15. Taxon synonyms

Create:

TaxonSynonym

Fields:

- id
- taxon_id
- synonym_name
- synonym_type
- source
- notes
- created_at

The system should preserve historical scientific names used in publications.

Do not automatically rewrite source publication names.

Store both:

name_verbatim

and:

accepted/current name

when available.

---

# 16. Biological entities

Mimicry may involve only part of an organism or a particular life stage.

Create:

BiologicalEntity

Fields:

- id
- taxon_id
- entity_type
- label
- sex
- life_stage
- anatomical_structure
- signal_description
- notes

Controlled entity types should initially support:

- whole organism
- adult
- male
- female
- juvenile
- larva
- nymph
- egg
- flower
- leaf
- seed
- fruit
- body region
- appendage
- call
- chemical signal
- lure
- colony
- nest
- other
- unknown

This allows relationships such as:

plant structure → butterfly egg

instead of incorrectly simplifying them to:

plant → butterfly.

---

# 17. MimicryInteraction

This is the core table.

Create:

MimicryInteraction

Minimum fields:

- id
- public_id
- mimic_taxon_id
- mimic_entity_id
- model_taxon_id
- model_entity_id
- receiver_taxon_id
- receiver_description
- interaction_status
- knowledge_status
- evidence_grade
- evidence_grade_reason
- mimicry_summary
- model_resolution
- receiver_resolution
- specific_model_identified
- geographic_overlap_status
- confidence
- curator_notes
- created_by
- reviewed_by
- created_at
- updated_at
- reviewed_at
- published_at

Public IDs should look like:

MIMICRY:000001

MIMICRY:000002

etc.

Public IDs must remain stable even if taxonomy changes.

---

# 18. Interaction status

Use controlled workflow states.

At minimum:

- candidate
- draft
- needs_review
- reviewed
- published
- rejected
- disputed
- withdrawn

Workflow:

Candidate
↓
Draft
↓
Needs Review
↓
Reviewed
↓
Published

Rejected records remain in the internal provenance system but are not shown publicly by default.

---

# 19. Knowledge status

Separate workflow status from scientific status.

For example:

- reported
- supported
- inferred

Do not confuse:

published website status

with:

scientific evidence status.

---

# 20. Mimicry types

Create controlled vocabulary tables rather than a hard-coded database enum where reasonable.

Initial terms should include:

- Batesian mimicry
- Müllerian mimicry
- aggressive mimicry
- reproductive mimicry
- sexual deception
- brood mimicry
- egg mimicry
- social mimicry
- parasitic mimicry
- floral mimicry
- food deception
- protective mimicry
- automimicry
- masquerade
- uncertain
- other

One interaction may receive multiple classification tags where scientifically appropriate.

Use many-to-many relations where necessary.

---

# 21. Signal modalities

Create controlled vocabulary:

- visual
- morphological
- colour
- pattern
- behavioural
- locomotor
- acoustic
- chemical
- olfactory
- tactile
- vibrational
- multimodal
- unknown
- other

A single interaction may involve multiple modalities.

Example:

ant-mimicking spider:

- visual
- morphological
- locomotor
- behavioural

Use a many-to-many relationship.

---

# 22. Receiver roles

Receiver information is scientifically important.

Support roles such as:

- predator
- prey
- pollinator
- mate
- host
- parasite
- competitor
- herbivore
- social partner
- unknown
- other

Do not require a specific receiver species when the literature only identifies a functional receiver class.

---

# 23. Evidence grading

Implement the following initial evidence framework.

## E0

Only resemblance terminology.

Examples:

“ant-like”

“wasp-like”

“resembles X”

No explicit demonstrated mimicry relationship.

---

## E1

Authors explicitly propose or identify mimicry.

Little or no ecological or experimental evidence.

---

## E2

Clear mimic and model relationship plus ecological, geographic, behavioral, sympatry, natural-history, or comparative support.

---

## E3

Quantitative or experimental evidence of resemblance or receiver response.

Examples:

- quantified phenotype similarity
- predator discrimination
- receiver behavioral experiment
- perceptual modelling

---

## E4

Strong direct experimental evidence that the mimetic resemblance changes biologically relevant outcomes.

Examples:

- survival
- predation
- pollination
- mating
- prey capture
- host response
- fitness-related outcome

Store:

- evidence_grade
- reason
- curator_confidence

Do not automatically infer evidence grade solely from keywords.

---

# 24. Reference model

Create:

Reference

Fields:

- id
- doi
- pmid
- title
- authors
- year
- journal
- volume
- issue
- pages
- url
- citation_text
- abstract
- reference_type
- notes
- created_at
- updated_at

One reference may support multiple interactions.

One interaction may have multiple references.

Therefore create:

InteractionReference

as a many-to-many relation.

---

# 25. Evidence model

Create:

Evidence

Fields:

- id
- interaction_id
- reference_id
- evidence_type
- evidence_text
- evidence_text_type
- page
- section
- figure
- table_number
- supplementary_material
- evidence_grade
- curator_comment
- source_method
- created_by
- created_at
- updated_at

source_method should support values such as:

- manual
- LLM extraction
- imported review
- external database
- other

LLM-extracted evidence must never silently become published scientific evidence.

---

# 26. Geography

Create a simple initial geographic model.

Fields may include:

- id
- interaction_id
- country
- region
- locality
- latitude
- longitude
- geographic_scope
- sympatry_status
- geographic_evidence
- notes

Do NOT implement complex GIS yet.

But design so future integration with:

- GBIF
- iNaturalist
- range polygons

is possible.

---

# 27. Evolutionary origin

Create a separate inference-layer model:

EvolutionaryOrigin

Fields:

- id
- public_id
- focal_mimic_clade_taxon_id
- model_taxon_id
- mimicry_type
- inferred_number_of_origins
- inference_method
- phylogeny_source
- analysis_version
- confidence
- notes
- created_at

Public ID example:

ORIGIN:000001

Interactions should be linkable to evolutionary origins.

Do NOT automatically assign origin = interaction.

---

# 28. Revision / audit log

Create:

AuditLog

Fields:

- id
- entity_type
- entity_id
- action
- old_value JSONB
- new_value JSONB
- changed_by
- reason
- timestamp

At minimum audit:

- interaction creation
- interaction edits
- scientific status changes
- publication
- rejection
- withdrawal
- evidence grade changes
- taxonomic corrections

---

# 29. User roles

Initial roles:

## Public

Can:

- browse
- search
- filter
- download public data

Cannot write data.

---

## Curator

Can:

- create taxa
- edit taxa
- create candidate interaction
- edit drafts
- add references
- add evidence
- review candidates

---

## Reviewer

Can additionally:

- mark reviewed
- approve records

---

## Admin

Can:

- publish
- withdraw
- manage users
- manage controlled vocabularies
- manage releases

Keep permissions simple but secure.

---

# 30. Supabase Row Level Security

RLS is mandatory.

Anonymous users should only read public/published scientific records.

Authenticated curators may edit records according to role.

Service-role credentials must NEVER appear in:

- browser bundle
- GitHub repository
- frontend JavaScript
- public environment variables

Only publishable/public Supabase client configuration may be included client-side.

Create:

.env.example

Never commit:

.env
.env.local
service role keys
database passwords

---

# 31. Public homepage

The homepage must clearly communicate the scientific purpose.

Hero:

# MimicryDB

## Who mimics whom across the Tree of Life?

Suggested subtitle:

An open database of documented mimic–model interactions across animals, plants, fungi, and other lineages.

Include primary actions:

- Explore interactions
- Browse taxa
- Explore models
- Explore mimics
- References
- Download data
- About MimicryDB

Show database statistics dynamically when a live database exists:

- published interactions
- mimic taxa
- model taxa
- references
- kingdoms represented

Never fabricate counts.

If demo data are used, clearly label:

DEMO / PROTOTYPE DATA.

---

# 32. Homepage scientific visualization

Reserve a visually prominent area for a future:

Tree of Life mimicry visualization.

For the MVP, implement a lightweight visualization using current demo/live data.

Possible first version:

kingdom/order/family-level mimic–model network.

The visualization should emphasize:

Mimic → Model

as directed edges.

Potential encodings:

node size
= number of interactions

incoming edges
= being mimicked

outgoing edges
= acting as mimic

Do not attempt a complete global phylogeny yet.

---

# 33. Explore Interactions page

Create:

/interactions/

Provide:

- searchable table
- pagination
- sorting
- filters
- URL-persisted filters where practical

Filters should support:

- mimic name
- model name
- mimic kingdom
- model kingdom
- mimicry type
- signal modality
- evidence grade
- receiver known/unknown
- model resolution
- cross-kingdom only
- publication year
- geographic region

Display:

Mimic
→
Model

Type

Modality

Evidence grade

Reference count

Status

Clicking opens detail page.

---

# 34. Interaction detail page

Example route:

/interactions/MIMICRY-000001/

Display prominently:

Mimic
→
Model

Then show:

- mimic taxonomy
- mimic entity
- model taxonomy
- model entity
- receiver
- mimicry type
- modalities
- evidence grade
- confidence
- geography
- evidence passages
- supporting references
- curator notes where public
- record history / last update
- related interactions

Include sections:

Other mimics of this model

Other models mimicked by this taxon

Related interactions

---

# 35. Taxon page

Example:

/taxa/formicidae/

Display:

scientific name

taxonomy hierarchy

external identifier if available

statistics:

Acts as mimic in X interactions

Acts as model in Y interactions

Acts as receiver in Z interactions

Sections:

As mimic

As model

As receiver

This page should be network-centric, not a generic encyclopedia page.

---

# 36. Models page

Create a page such as:

/models/

Display frequently mimicked taxa.

Allow ranking by:

- number of interactions
- number of mimic taxa
- number of mimic clades
- independent origins when available

Allow evidence-grade threshold filters.

This page should eventually help answer:

Which organisms are most frequently mimicked?

---

# 37. Mimics page

Create:

/mimics/

Display taxa that most frequently act as mimics.

Support:

- interaction count
- model diversity
- mimicry type
- evidence filter

---

# 38. References page

Create:

/references/

Search by:

- title
- author
- DOI
- journal
- year

Reference detail page should show:

This publication supports X MimicryDB interactions.

List those interactions.

---

# 39. Search

Global search must support:

- scientific name
- taxonomic synonym
- interaction ID
- DOI
- paper title

Prioritize taxon matches followed by interactions.

---

# 40. Data download

Create:

/download/

Initially support CSV exports for:

- interactions
- taxa
- references
- evidence
- interaction-reference links
- vocabularies

Include:

- export date
- MimicryDB version
- schema version
- metadata
- citation information

Later support:

JSON

Do not require authentication to download published data.

---

# 41. Curator dashboard

Create protected route:

/admin/

or:

/curator/

Dashboard should show:

- candidate interactions
- drafts
- needs review
- reviewed
- published
- rejected
- recently edited
- recently added references

Prioritize usability over visual decoration.

---

# 42. Add interaction workflow

Do NOT create one huge form.

Use a multi-step workflow:

Step 1
Mimic

Step 2
Mimic entity

Step 3
Model

Step 4
Model entity

Step 5
Receiver

Step 6
Mimicry type

Step 7
Signal modalities

Step 8
Reference

Step 9
Evidence passage

Step 10
Evidence grade

Step 11
Geography

Step 12
Review summary

Then allow:

Save Draft

Submit for Review

Publish only if authorized.

Autosave drafts if reasonable.

---

# 43. Candidate Inbox

Build the data model and interface for future LLM literature mining.

Candidate records may contain:

- proposed mimic
- proposed model
- proposed receiver
- proposed mimicry type
- proposed modality
- proposed evidence grade
- reference
- evidence passage
- extraction confidence
- extraction model
- extraction prompt version
- extraction timestamp
- raw extraction JSON

Actions:

Accept

Edit

Reject

Needs Review

A candidate must NEVER directly become Published without human curation.

---

# 44. Future LLM workflow

Design for:

Literature corpus
↓
LLM abstract screening
↓
LLM relation extraction
↓
Candidate records
↓
Human curator
↓
Reviewed interaction
↓
Published database

LLM output should be treated as:

candidate data

not:

scientific truth.

---

# 45. CSV import

Implement curator CSV import.

Provide:

- template CSV
- example CSV
- validation
- preview
- error report
- duplicate warning
- confirmation before database write

Use atomic import where possible.

If validation fails:

do not partially import scientific data.

---

# 46. Duplicate handling

Do NOT enforce:

mimic_taxon_id + model_taxon_id

as globally unique.

The same pair may have different:

- receivers
- life stages
- sexes
- modalities
- geographic contexts
- mimicry mechanisms
- evidence contexts

Instead implement:

possible duplicate detection.

Show curator:

“Potential existing interaction found.”

Allow curator to:

link
merge
continue separately
cancel.

---

# 47. Uncertain information

Scientific uncertainty must be representable.

Support:

- unknown
- uncertain
- unresolved
- not reported
- not applicable

Do not force a curator to invent data simply to satisfy non-null constraints.

Document the difference between:

NULL

Unknown

Not applicable

where scientifically relevant.

---

# 48. Public REST/data API

Because GitHub Pages cannot host a server API, expose public scientific data through Supabase REST or a thin client abstraction.

Create frontend data-access functions so UI components do NOT directly contain raw Supabase query logic everywhere.

Structure something like:

src/lib/api/
src/lib/data/
src/lib/supabase/

Provide documented public query patterns.

Examples:

published interactions

model = Formicidae

mimic kingdom = Plantae

model kingdom = Animalia

evidence >= E3

The frontend data layer must be replaceable later without rewriting the whole UI.

---

# 49. Network visualization MVP

Implement a lightweight initial network visualization.

Nodes:

taxa or aggregated taxonomic groups.

Edges:

mimic → model

Possible aggregation levels:

kingdom
order
family

Allow filters:

- mimicry type
- modality
- evidence grade
- kingdom transition

Support:

hover

click

zoom

pan

Do not allow visualization work to block core database functionality.

---

# 50. Design language

MimicryDB is scientific infrastructure.

Design characteristics:

- restrained
- modern
- academic
- biological
- data-centric
- highly readable
- responsive
- accessible
- light mode first
- excellent typography
- information-rich without clutter

Avoid:

- generic AI startup appearance
- glassmorphism
- excessive gradients
- giant empty hero areas
- pricing-page aesthetics
- excessive animation
- marketing buzzwords
- fake metrics

The site should feel closer to:

a modern biodiversity data portal

than:

a startup landing page.

---

# 51. Brand identity

Use:

MimicryDB

as primary brand.

Scientific tagline:

Who mimics whom across the Tree of Life?

Use restrained visual motifs inspired by:

- phylogenetic networks
- directed interactions
- biodiversity
- biological convergence

Do not use cartoon animals as the primary brand identity.

---

# 52. Demo data

Development may include 5–20 example records.

Every demo record must be clearly labeled:

DEMO DATA

or exist only in a demo seed environment.

Do not present illustrative relationships as scientifically curated production records unless manually verified.

Separate:

demo seed

from:

production database.

---

# 53. Data versioning

The live database continuously changes.

Scientific publications require frozen datasets.

Therefore support:

Live database
+
Versioned releases

Example:

MimicryDB v0.1.0

MimicryDB v0.2.0

MimicryDB v1.0.0

Each release should eventually contain:

interactions.csv

taxa.csv

references.csv

evidence.csv

interaction_references.csv

controlled_vocabularies.csv/json

metadata.json

schema_version

checksums

README

---

# 54. GitHub Releases

Create a release workflow or release script.

Preferred future command:

npm run release:data

or equivalent.

Future GitHub Action:

.github/workflows/release-data.yml

Manual input:

version

Example:

v0.1.0

Process:

validate
↓
export
↓
generate metadata
↓
generate checksums
↓
create release
↓
attach files

If live database export cannot yet be safely automated, implement the infrastructure and documentation rather than fake it.

---

# 55. Future Zenodo integration

Design releases so they can later be archived through Zenodo and assigned DOI.

Do not require Zenodo for MVP launch.

Add documentation placeholder for:

Citation

Data DOI

Software DOI

---

# 56. GitHub Actions CI

Create:

.github/workflows/ci.yml

Trigger on:

pull_request

and optionally pushes.

Run:

install dependencies

lint

typecheck

unit tests

data/schema validation

production build

CI failures should be treated as blockers.

---

# 57. GitHub Pages deployment

Create:

.github/workflows/deploy-pages.yml

Trigger:

push to main

and:

workflow_dispatch

Workflow:

checkout
↓
setup Node
↓
install
↓
lint
↓
typecheck
↓
test
↓
build Astro static site
↓
upload Pages artifact
↓
deploy GitHub Pages

Use current official GitHub Pages Actions.

Do not maintain an unnecessary gh-pages branch if Actions deployment works.

---

# 58. GitHub Pages configuration

Ensure repository Pages settings use:

GitHub Actions

as deployment source.

If possible through GitHub CLI/API, configure this automatically.

If permissions prevent automatic configuration, report the exact required manual action.

Do not claim deployment success until verified.

---

# 59. GitHub project metadata

Set if permitted:

Repository description:

An open database of mimic–model interactions across the Tree of Life.

Suggested topics:

mimicry

evolution

macroevolution

biodiversity

ecology

phylogenetics

evolutionary-biology

scientific-database

open-data

bioinformatics

Do not recreate the repository.

---

# 60. README

Create a high-quality scientific README.

Minimum sections:

# MimicryDB

Who mimics whom across the Tree of Life?

## Project status

Clearly state:

Prototype / Alpha / Beta / Production

## Scientific motivation

## What is a mimicry interaction?

Mimic → Model | Receiver

## Data model

## Evidence grading

## Features

## Public portal

## Data access

## Data releases

## Curation

## Development

## Testing

## Deployment

## Contributing

## Citation

## License

## Contact / maintainers

Do not claim the database is complete.

---

# 61. Scientific documentation

Create:

docs/ARCHITECTURE.md

docs/DATABASE_SCHEMA.md

docs/DATA_DICTIONARY.md

docs/CURATION_GUIDE.md

docs/EVIDENCE_GUIDELINES.md

docs/TAXONOMY_POLICY.md

docs/LLM_EXTRACTION_POLICY.md

docs/RELEASE_POLICY.md

docs/ROADMAP.md

These documents are part of the scientific product.

---

# 62. CONTRIBUTING.md

Explain how researchers can contribute potential records.

Minimum required information:

- Mimic
- Model
- Reference
- evidence
- DOI or complete citation

Explain:

reported resemblance
≠
experimentally demonstrated mimicry.

External contributors must not be able to directly publish database records.

---

# 63. GitHub Issues

Add issue templates for:

## Suggest a mimicry interaction

## Report an incorrect record

## Taxonomic correction

## Bug report

## Feature request

Issue reports should never automatically edit production data.

---

# 64. Pull request template

Create a PR template reminding contributors to:

- run tests
- describe scientific-data implications
- update documentation
- avoid secrets
- distinguish demo data from production data

---

# 65. Security

Never commit:

Supabase service role key

database password

private API credentials

GitHub PAT

LLM API keys

Ensure `.gitignore` protects secrets.

Create:

.env.example

with placeholders only.

Inspect Git history before final delivery to make sure credentials have not accidentally been committed.

---

# 66. Repository organization

A reasonable target structure:

MimicryDB/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-pages.yml
│   │   └── release-data.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── lib/
│   │   ├── api/
│   │   ├── data/
│   │   ├── supabase/
│   │   └── validation/
│   └── styles/
│
├── public/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
│
├── data/
│   ├── demo/
│   ├── controlled-vocabularies/
│   └── schemas/
│
├── scripts/
│   ├── validate-data/
│   ├── import-data/
│   ├── export-data/
│   └── release-data/
│
├── docs/
│
├── tests/
│
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
├── README.md
├── astro.config.*
├── package.json
└── tsconfig.json

Adjust when technically appropriate.

Avoid unnecessary monorepo complexity.

---

# 67. License

Choose an appropriate open-source software license.

Prefer:

MIT

for software unless existing repository already specifies another compatible license.

Scientific database/data licensing should be documented separately.

For data consider a future:

CC BY 4.0

or:

CC0

but do NOT make the final scientific licensing decision silently if no policy exists.

Document this as a project decision requiring confirmation.

---

# 68. Testing

At minimum test:

interaction validation

reference relations

evidence relations

duplicate detection

filtering

CSV import validation

authentication permissions

RLS policies where feasible

public data access

admin access

revision logging

GitHub Pages build

base-path handling

Do not overbuild the testing framework, but critical data integrity must be tested.

---

# 69. Accessibility

Use semantic HTML.

Ensure:

keyboard navigation

proper labels

sensible heading hierarchy

sufficient contrast

responsive tables

accessible forms

Do not sacrifice accessibility for visual effects.

---

# 70. Performance

Do not download the entire future database into the browser on every page.

Design queries for future tens of thousands of interactions.

Use:

pagination

indexed database columns

server-side database filtering through Supabase REST

efficient client queries

Use indexes for frequently queried columns such as:

mimic_taxon_id

model_taxon_id

interaction_status

evidence_grade

public_id

DOI

taxonomic fields where justified.

---

# 71. Scientific scalability

Assume eventual scale could reach:

5,000–20,000+ mimicry interactions

thousands of taxa

thousands of references

many evidence records

many revisions

possibly much larger later.

Do not optimize for only ten demo records.

---

# 72. Future phylogenetic integration

Do not implement full Tree-of-Life phylogenetic calculations yet.

But reserve future support for:

- phylogenetic tree IDs
- divergence times
- taxon-tree mapping
- mimic–model phylogenetic distance
- independent origin reconstruction
- ancestral-state analyses

Keep these outside the observational interaction core.

---

# 73. Future external taxonomy integration

The architecture should later permit reconciliation against resources such as:

Catalogue of Life

GBIF

WoRMS

POWO

NCBI Taxonomy

Open Tree of Life

Do not implement uncontrolled automatic synonym correction in the MVP.

Taxonomic normalization must remain reviewable.

---

# 74. Future literature-mining scale

Assume the project may eventually screen:

5,000–20,000 publications.

The candidate extraction pipeline should therefore support batch ingestion.

Design Candidate tables so each candidate stores:

reference

model version

prompt version

timestamp

raw extraction

confidence

review status

This is important for reproducibility.

---

# 75. Development workflow

Do NOT attempt to blindly write the entire application in one giant code generation pass.

Work iteratively.

However, unless blocked by permissions or missing credentials, continue through all phases without asking for repeated confirmation.

Use the following implementation phases.

---

# PHASE 0 — Repository inspection

Clone/use:

https://github.com/ZyYang0124/MimicryDB.git

Inspect:

existing files

Git history

branch

remote

GitHub auth

existing Pages settings if accessible

existing workflows

existing package configuration

Document assumptions.

---

# PHASE 1 — Architecture

Create architecture documentation.

Finalize:

frontend choice

database model

authentication model

RLS model

directory structure

routing structure

GitHub Pages deployment

data flow

scientific curation workflow

Do not stop after writing the plan unless a genuine blocker exists.

---

# PHASE 2 — Project foundation

Initialize Astro/TypeScript/Tailwind as needed.

Configure:

GitHub Pages base path

lint

typecheck

tests

environment configuration

GitHub Actions

README

---

# PHASE 3 — Scientific schema

Implement:

Supabase migrations

tables

foreign keys

indexes

controlled vocabularies

RLS policies

audit structure

demo seed data

validation schemas

---

# PHASE 4 — Public portal

Implement:

homepage

interaction explorer

interaction detail

taxon pages

mimics page

models page

references page

download page

about page

documentation links

global search

---

# PHASE 5 — Curator interface

Implement:

authentication

curator dashboard

create/edit interaction

reference management

evidence management

review workflow

candidate inbox

publication workflow

---

# PHASE 6 — Import/export

Implement:

CSV template

CSV validation

CSV preview

atomic import

CSV export

release scripts

---

# PHASE 7 — Visualization

Implement:

basic mimic–model network

filters

click interactions

aggregation

Do not let visualization delay core functionality.

---

# PHASE 8 — Testing and hardening

Run:

lint

typecheck

unit tests

integration tests where reasonable

production build

secret scan

base-path checks

accessibility checks

---

# PHASE 9 — GitHub integration

Commit work in meaningful commits.

Examples:

chore: initialize MimicryDB portal

feat: add scientific interaction schema

feat: add public interaction explorer

feat: add curator workflow

feat: add evidence and reference provenance

feat: add mimic-model network

ci: add GitHub Pages deployment

docs: add MimicryDB curation guidelines

Push to:

origin/main

unless repository protection requires PR workflow.

Respect existing branch protection rules.

---

# PHASE 10 — GitHub Pages deployment

Actually trigger deployment.

Inspect GitHub Actions.

If deployment fails:

read logs

fix errors

commit fixes

push

rerun

Repeat until deployment succeeds or a genuine permissions blocker is reached.

Verify the actual site.

Expected portal:

https://zyyang0124.github.io/MimicryDB/

Check:

homepage loads

CSS loads

JavaScript loads

refresh works

nested routes work

assets work

mobile layout works

no base-path 404s

---

# 76. Git strategy

Do not produce one giant commit.

Use meaningful commits reflecting logical milestones.

Before potentially destructive changes:

inspect status

preserve prior work

avoid unnecessary force pushes

Never rewrite Git history without a compelling reason.

---

# 77. Existing repository preservation

Because this repository already exists:

DO NOT run destructive commands such as:

git reset --hard

git clean -fd

force push

unless absolutely necessary and after explicitly documenting why.

Preserve useful files.

If existing implementation conflicts with the recommended architecture, migrate carefully rather than deleting blindly.

---

# 78. Avoid repeated clarification

When a reasonable engineering default exists:

make the decision

document it

continue.

Only stop for genuinely blocking information such as:

GitHub authentication unavailable

Supabase project credentials unavailable

permissions unavailable

a scientifically important policy decision that would be difficult to reverse.

If Supabase credentials are unavailable, do NOT stop the entire project.

Instead:

implement database migrations

implement typed data-access layer

implement demo/static adapter

implement `.env.example`

implement UI

deploy a functional prototype to GitHub Pages

clearly document how to attach Supabase later.

The public prototype should still deploy.

---

# 79. Graceful data adapter architecture

Implement a data provider abstraction so development can work before live Supabase credentials exist.

For example:

DataProvider

with implementations:

DemoDataProvider

SupabaseDataProvider

The UI should not care which provider is active.

Development/demo mode:

local validated demo dataset.

Production once Supabase is configured:

Supabase.

Clearly label demo mode publicly.

This avoids blocking GitHub Pages deployment on database credentials.

---

# 80. No fabricated science

Never invent:

publication metadata

DOIs

taxonomic facts

experimental evidence

database statistics

interaction counts

scientific conclusions

If demo relationships are used:

label them as demo/sample records.

Do not present fabricated evidence text.

---

# 81. No fabricated deployment status

Never claim:

GitHub Pages is live

CI passed

repository updated

deployment succeeded

unless verified.

At final completion report actual statuses.

---

# 82. MVP completion criteria

The MVP is considered successful when as many of the following as possible are true:

1. Existing GitHub repository successfully used
2. Main architecture documented
3. Astro application builds successfully
4. GitHub Pages configuration is correct
5. GitHub Actions CI exists
6. GitHub Pages workflow exists
7. Public homepage works
8. Interaction explorer works
9. Interaction detail works
10. Taxon page works
11. Model and mimic views work
12. Reference page works
13. Demo/live data adapter works
14. Search works
15. Filters work
16. Scientific schema exists
17. Evidence model exists
18. Revision model exists
19. Candidate model exists
20. Curator workflow is represented
21. CSV export works
22. README is complete
23. Scientific documentation exists
24. tests pass
25. secrets are not exposed
26. meaningful Git history exists
27. changes pushed to GitHub
28. GitHub Pages deployment attempted
29. deployment verified if permissions allow

---

# 83. Final report

When work is complete, provide a concise implementation report.

Include:

## Repository

Actual repository URL

## GitHub Pages

Actual deployed URL

## Branch

Current branch

## Latest commit

Commit hash + message

## CI

PASS / FAIL

## Pages deployment

PASS / FAIL

## Implemented

Short list

## Not yet implemented

Short list

## External configuration still required

For example:

Supabase URL

Supabase publishable key

Supabase Auth settings

GitHub Pages permission setting

## Scientific architecture notes

Important decisions made

## Next recommended development priority

One concise recommendation.

Do not report hypothetical success as actual success.

---

# 84. Current scientific scope

The portal should be capable of representing mimicry across the entire Tree of Life.

Do not artificially restrict the database schema to animals.

It must support relationships including:

Animal → Animal

Plant → Animal

Animal → Plant

Plant → Plant

Fungus → Animal

Fungus → Plant

other biological combinations.

The architecture must therefore remain taxonomically general.

---

# 85. Biological model resolution

A model may be identified only as:

species

genus

family

order

higher taxon

functional model class

unknown

Therefore explicitly store:

model_resolution

Do not discard lower-resolution literature records.

Future analyses can choose subsets based on resolution.

---

# 86. Scientific priority

The portal is currently the first priority of the broader research project.

The purpose is to establish durable infrastructure before large-scale LLM-assisted literature mining begins.

The intended workflow is:

Schema
↓
Portal
↓
Gold-standard curated records
↓
LLM extraction pipeline
↓
Large-scale database growth
↓
Tree-of-Life mapping
↓
Macroevolutionary analysis

Design decisions should support this sequence.

---

# 87. Gold-standard dataset preparation

Design the portal so we can manually curate an initial:

300–500 high-quality interactions

that will later serve as:

scientific pilot dataset

LLM validation dataset

data-schema stress test

curation benchmark

Do not hard-code assumptions based on a tiny demo dataset.

---

# 88. Long-term vision

MimicryDB should eventually support:

interactive Tree-of-Life mapping

mimicry hotspot analysis

model hub analysis

cross-kingdom interaction analysis

phylogenetic-distance calculations

independent-origin inference

geographic overlays

LLM literature mining

community contributions

API access

versioned scientific releases

DOI-linked datasets

reproducible research

The MVP does not need to implement all of these now.

It must avoid architectural choices that make them unnecessarily difficult later.

---

# 89. Engineering philosophy

Prioritize:

scientific reproducibility

provenance

maintainability

clarity

security

data integrity

extensibility

open science

accessibility

Use boring, mature technology where possible.

Avoid unnecessary technical novelty.

The interesting novelty is the science, not the web framework.

---

# 90. Start now

Begin by inspecting the existing repository:

https://github.com/ZyYang0124/MimicryDB.git

Then:

1. inspect current state
2. produce a concise internal implementation plan
3. make architecture decisions
4. begin implementation
5. run tests continuously
6. commit meaningful milestones
7. push to the existing repository
8. configure GitHub Actions
9. deploy to GitHub Pages
10. inspect the live deployment
11. fix deployment problems
12. provide the final verified report

Do not merely generate example code or instructions for me to manually implement.

If the environment allows you to perform an action, perform it.

Only ask me to intervene when credentials, authorization, or another genuine external permission is required.

The immediate goal is:

# A working, publicly accessible MimicryDB prototype deployed from the existing GitHub repository via GitHub Pages, with a scientifically sound data architecture that can later support continuous curation and LLM-assisted literature mining.
