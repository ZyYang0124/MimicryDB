-- 008_interaction_type_links.sql — make interactions ontology-linked (SOP Phase 2.4).
-- DATABASE_SCHEMA.md documented these M2M joins before they existed (doc-first drift);
-- migration 008 makes the schema match the documentation. Types/modalities now resolve
-- to vocabulary_term rows — the ontology, not free text, is authoritative.
create table if not exists interaction_mimicry_type (interaction_id uuid not null references mimicry_interaction(id) on delete cascade, vocabulary text not null default 'mimicry_type', term text not null, primary key (interaction_id, vocabulary, term), foreign key (vocabulary, term) references vocabulary_term(vocabulary, term) on delete cascade);
create table if not exists interaction_signal_modality (interaction_id uuid not null references mimicry_interaction(id) on delete cascade, vocabulary text not null default 'signal_modality', term text not null, primary key (interaction_id, vocabulary, term), foreign key (vocabulary, term) references vocabulary_term(vocabulary, term) on delete cascade);
alter table interaction_mimicry_type enable row level security; alter table interaction_signal_modality enable row level security;
create policy "public interaction types" on interaction_mimicry_type for select using (exists (select 1 from mimicry_interaction i where i.id = interaction_id and i.interaction_status = 'published'));
create policy "public interaction modalities" on interaction_signal_modality for select using (exists (select 1 from mimicry_interaction i where i.id = interaction_id and i.interaction_status = 'published'));
