# Evidence guidelines

Every MimicryDB record carries an evidence grade with a written curator justification and an evidence passage. **Grades are never assigned by keywords alone.**

| Grade | Meaning | Typical support |
| --- | --- | --- |
| **E0** | Resemblance terminology only | "ant-like", "wasp-like", "resembles X" — no explicit mimicry claim |
| **E1** | Explicit author proposal | A cited author proposes the interaction as mimicry, little/no supporting data |
| **E2** | Ecological, geographic or behavioral support | Sympatry, seasonality, natural history or comparative evidence consistent with mimicry |
| **E3** | Quantitative or experimental resemblance or receiver response | Quantified phenotype similarity, predator discrimination, receiver behavioral experiments, perceptual modelling |
| **E4** | Direct experimental biological outcome | Experiments demonstrate survival, predation, pollination, mating, prey capture, host response or another fitness-relevant outcome |

## Rules

1. Reported resemblance is **not** equivalent to demonstrated mimicry — do not upgrade grades to make records look stronger than their sources.
2. The curator records the grade **reason** and the supporting passage; without both, a record cannot leave draft.
3. When literature disagrees (e.g. a case long taught as Batesian and later reinterpreted), keep the dispute visible in the record rather than silently choosing a side.
4. LLM-extracted evidence enters at `source_method = 'LLM extraction'` and never silently upgrades a grade (`docs/LLM_EXTRACTION_POLICY.md`).

The same framework is described for the public at `/evidence/` on the portal.
