-- 007_public_reads.sql — the public site must read the backbone tables.
-- taxon and reference had RLS enabled in migration 001 without a select policy,
-- which made them invisible to anonymous readers. They are non-sensitive
-- (taxonomy backbone + bibliographic metadata): public SELECT is correct.
-- mimicry_interaction stays gated to interaction_status='published' (001);
-- demo/candidate rows remain invisible (docs/CURATION_GUIDE.md).
create policy "public taxa" on taxon for select using (true);
create policy "public references" on reference for select using (true);
