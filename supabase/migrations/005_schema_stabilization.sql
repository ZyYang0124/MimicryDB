-- 005_schema_stabilization.sql — v0.3: the ten-object core data layer (additive only).
-- Product definition (docs/ROADMAP.md): evidence-aware, interaction-centered,
-- community-curated knowledge base across the Tree of Life.
--  * entity generalizes biological_entity (models may be objects/signals, not taxa);
--    biological_entity is retained for compatibility and will be migrated in v0.4.
--  * taxon_external_identifier replaces the single external_source/external_taxon_id
--    pair on taxon: a name usage can live in GBIF, CoL, NCBI, OpenTree, WoRMS, POWO…
--  * mimicry_system is an optional grouping layer (rings, complexes) above atomic
--    interactions — never a replacement for the directed edge.
--  * evidence_support upgrades the E0–E4 grade with per-dimension support direction:
--    the database must be able to hold evidence that CONTRADICTS a mimicry claim.
--  * vocabulary_term gains stable public IDs, hierarchy and versioning (FAIR).
--  * reference gains Crossref-shaped metadata for DOI-first curation.
--  * contributor/contribution give community curators a citable identity.

create table if not exists entity (id uuid primary key default gen_random_uuid(), public_id text unique, entity_type text not null default 'unresolved', taxon_id uuid references taxon(id), label text not null, description text, parent_entity_id uuid references entity(id), created_at timestamptz default now());
do $$ begin
  alter table entity add constraint entity_type_check check (entity_type in ('taxon','organism','sex','life_stage','anatomical_structure','signal','environmental_object','biological_material','functional_class','unresolved'));
exception when duplicate_object then null; end $$;

create table if not exists taxon_external_identifier (id uuid primary key default gen_random_uuid(), taxon_id uuid not null references taxon(id) on delete cascade, authority text not null, external_id text not null, external_url text, matched_name text, match_type text, verified_at timestamptz, unique (authority, external_id));

create table if not exists mimicry_system (id uuid primary key default gen_random_uuid(), public_id text unique not null, name text not null, description text, system_type text, notes text, created_at timestamptz default now());
do $$ begin
  alter table mimicry_system add constraint mimicry_system_type_check check (system_type in ('ring','complex','polymorphic','series','other'));
exception when duplicate_object then null; end $$;
create table if not exists system_interaction (system_id uuid not null references mimicry_system(id) on delete cascade, interaction_id uuid not null references mimicry_interaction(id) on delete cascade, primary key (system_id, interaction_id));

create table if not exists evidence_support (id uuid primary key default gen_random_uuid(), evidence_id uuid not null references evidence(id) on delete cascade, dimension text not null, support_direction text not null default 'supports', strength text, curator_note text);
do $$ begin
  alter table evidence_support add constraint evidence_support_dimension_check check (dimension in ('resemblance','model_identity','receiver_identity','receiver_perception','receiver_response','fitness_consequence','geographic_overlap','temporal_overlap','mechanism','signal_characterization'));
  alter table evidence_support add constraint evidence_support_direction_check check (support_direction in ('supports','contradicts','mixed','uncertain'));
exception when duplicate_object then null; end $$;

alter table vocabulary_term add column if not exists public_id text, add column if not exists parent_term text, add column if not exists synonyms text[], add column if not exists inclusion_criteria text, add column if not exists exclusion_criteria text, add column if not exists source_references text[], add column if not exists status text default 'accepted', add column if not exists version text default '1.0';
create unique index if not exists vocabulary_term_public_id_uidx on vocabulary_term(public_id);

alter table reference add column if not exists volume text, add column if not exists issue text, add column if not exists pages text, add column if not exists issn text, add column if not exists publisher text, add column if not exists license text, add column if not exists reference_type text, add column if not exists crossref_metadata jsonb, add column if not exists crossref_verified_at timestamptz;

create table if not exists contributor (id uuid primary key default gen_random_uuid(), name text not null, orcid text unique, affiliation text, role text, created_at timestamptz default now());
create table if not exists contribution (id uuid primary key default gen_random_uuid(), contributor_id uuid not null references contributor(id) on delete cascade, contribution_type text not null, interaction_id uuid references mimicry_interaction(id), evidence_id uuid references evidence(id), reference_id uuid references reference(id), notes text, created_at timestamptz default now());
do $$ begin
  alter table contribution add constraint contribution_type_check check (contribution_type in ('interaction','evidence','taxonomy','reference','review','correction'));
exception when duplicate_object then null; end $$;

alter table entity enable row level security; alter table taxon_external_identifier enable row level security; alter table mimicry_system enable row level security; alter table system_interaction enable row level security; alter table evidence_support enable row level security; alter table contributor enable row level security; alter table contribution enable row level security;
create policy "public entities" on entity for select using (true);
create policy "public taxon external identifiers" on taxon_external_identifier for select using (true);
create policy "public mimicry systems" on mimicry_system for select using (exists (select 1 from system_interaction si join mimicry_interaction i on i.id = si.interaction_id where si.system_id = id and i.interaction_status = 'published'));
create policy "public system interactions" on system_interaction for select using (exists (select 1 from mimicry_interaction i where i.id = interaction_id and i.interaction_status = 'published'));
create policy "public evidence support" on evidence_support for select using (true);
create policy "public contributors" on contributor for select using (true);
create policy "public contributions" on contribution for select using (true);
