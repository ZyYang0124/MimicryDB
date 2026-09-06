-- 006_evidence_v1.sql — SOP Phase 2 + Phase 4 completion (additive only).
--  * taxon.public_id (TAXON:NNNNNN) — every published core object carries a stable ID.
--  * mimicry_interaction.receiver_entity_id — the receiver is an entity too, so
--    "male bee", "incubating host parents" and "predator" can be first-class entities.
--  * evidence v1: stable public IDs (EVIDENCE:NNNNNN), evidence_type, locator_table,
--    curator_note, created_by/reviewed_by, workflow status. E-grade stays as the
--    summary; per-dimension truth lives in evidence_support (migration 005), whose
--    strength now has a controlled vocabulary.

alter table taxon add column if not exists public_id text;
create unique index if not exists taxon_public_id_uidx on taxon(public_id);
alter table mimicry_interaction add column if not exists receiver_entity_id uuid references entity(id);
alter table evidence add column if not exists public_id text, add column if not exists evidence_type text, add column if not exists locator_table text, add column if not exists curator_note text, add column if not exists created_by uuid, add column if not exists reviewed_by uuid, add column if not exists status text default 'candidate';
create unique index if not exists evidence_public_id_uidx on evidence(public_id);
do $$ begin
  alter table evidence_support add constraint evidence_support_strength_check check (strength in ('strong','moderate','weak','unknown'));
exception when duplicate_object then null; end $$;
alter table evidence enable row level security;
create policy "public evidence" on evidence for select using (exists (select 1 from mimicry_interaction i where i.id = interaction_id and i.interaction_status = 'published'));
