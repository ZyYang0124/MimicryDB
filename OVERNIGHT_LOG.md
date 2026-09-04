# Overnight development log — 2026-09-05

| Local time | Iteration | Commit | Notes |
| --- | --- | --- | --- |
| 00:01 | baseline | ec3aed1 | v0.2.0 data provider, browsing & evidence framework (uncommitted session work) |
| 00:01 | baseline | a2bf461 | master development prompt committed |
| 00:03 | roadmap | — | docs/ROADMAP.md + iteration plan written |
| 00:04 | iter1 docs | 5c96408 | 5 policy docs + DATA_DICTIONARY + full README (spec §60) |
| 00:06 | iter2 schema | 37f4859 | migration 002 (vocab/entities/candidates/origins/geography/M2M/indexes/RLS) + structured data layer |
| 00:11 | iter3 portal | 42f7357 | /models/ /mimics/ /references/ /search/ sortable table + homepage SVG network |
| 00:12 | fix | 6b684f6 | astro check had 4 errors on search index types — fixed, exit 0 |
| 00:14 | iter4 pipeline | 4fdf996 | validate-data + export-data + release-data.yml + vocabularies JSON |
| 00:16 | iter5 tests | 2e079fd | shared CSV module, detectDuplicates, pipeline tests, CI validate step |
| 00:17 | push attempt 1 | — | FAILED: cannot connect github.com:443 |
| 00:20 | iter6 curator | e12dcd3 | /curator/ dashboard prototype + synthetic candidate inbox |
| 00:21 | iter7 infra | 9adafba | LICENSE, CHANGELOG, 5 issue templates, PR template, head metadata |
| 00:23 | iter8 seed | 6634529 | generated supabase/seed.sql + sync test (never seeds published) |
| 00:25 | iter9 portal polish | 42d2524 | hero actions, 404, robots.txt, about/architecture expansion |
| 00:27 | iter10 import | 383084d | CSV import pre-check CLI + validation module + template (spec §45) |
| 00:29 | iter11 query API | d5e5708 | data.query() paged/filterable — Supabase adapter contract (spec §48) |
| 00:30 | iter12 dataset | b46c292 | 3 canonical records (spider/ant, drone fly/bee, viceroy/monarch w/ dispute) |
| 00:31 | a11y | dab82c2 | html lang + body + nav label; audit 60/60 pages clean |
| 00:33 | iter14 docs | 7872275 | evidence distribution chart, README query docs, changelog; release:v0.3.0 dry-run OK |
| 00:34 | push attempts 2–3 | — | FAILED: connection reset / could not connect; background retry loop started (15 min interval, stops 07:30) |
| — | QA | — | dist audit: 60 pages, 800 internal links 0 broken, a11y clean, 17/17 tests, check 0 errors, build green |
