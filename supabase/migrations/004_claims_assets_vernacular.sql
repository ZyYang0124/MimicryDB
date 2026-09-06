-- 004: claim-level citation, record-level metadata, media assets, vernacular names.
-- Lessons folded in from AntWeb / AntCat (claim + locator citations, specimen-first media)
-- and xeno-canto (record-level observation metadata). Purely additive.
alter table interaction_reference add column if not exists claim_roles text[] default '{}';
alter table interaction_reference add column if not exists locator text;
alter table mimicry_interaction add column if not exists observed_on date;
alter table mimicry_interaction add column if not exists recorded_by text;
do $$ begin
  alter table interaction_reference add constraint interaction_reference_claim_roles_check
    check (claim_roles is null or claim_roles <@ array['mimic-resemblance','model-identity','receiver-response','mechanism','distribution','taxonomy']::text[]);
exception when duplicate_object then null; end $$;
create table if not exists taxon_image (id uuid primary key default gen_random_uuid(), public_id text unique, taxon_id uuid references taxon(id) on delete cascade, file_url text not null, source_page_url text, title text, license text, license_url text, artist text, life_stage text, created_at timestamptz default now());
create table if not exists taxon_vernacular (id uuid primary key default gen_random_uuid(), taxon_id uuid references taxon(id) on delete cascade, name text not null, language text not null default 'zh', preferred boolean default false, source text not null default 'GBIF', unique (taxon_id, name, language));
alter table taxon_image enable row level security; alter table taxon_vernacular enable row level security;
create policy "public taxon images" on taxon_image for select using (true);
create policy "public taxon vernacular" on taxon_vernacular for select using (true);
