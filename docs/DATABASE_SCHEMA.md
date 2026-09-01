# Database schema

The initial migration defines `taxon`, `reference`, `mimicry_interaction`, `evidence`, and `audit_log`, with foreign keys, timestamps, stable public IDs, and public-read RLS limited to published interactions. Future migrations add controlled vocabularies, entities, geography, origins, candidates, and role-based curator policies.
