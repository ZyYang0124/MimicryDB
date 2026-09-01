# Architecture

Astro statically renders the public portal for GitHub Pages (`/MimicryDB/`). Demo data is a typed local adapter; Supabase is the planned live adapter. PostgreSQL remains normalized and separates observation, evaluation, inference, and provenance. Authentication and authorization belong to Supabase Auth + RLS; service-role credentials never enter the client bundle.
