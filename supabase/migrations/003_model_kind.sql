-- 003_model_kind.sql — distinguish WHAT is being mimicked: another organism, the
-- environment/background, or an inanimate object (prompt: 模仿其它物种 vs 模仿环境)
alter table mimicry_interaction add column if not exists model_kind text default 'organism';
insert into vocabulary_term (vocabulary, term, label, sort_order) values
 ('model_kind','organism','Another organism (species/taxon as model)',1),
 ('model_kind','environment','Environment or background (foliage, bark, sand, water)',2),
 ('model_kind','object','Inanimate object (bird droppings, stones, dew)',3),
 ('model_kind','self','Same species / self (automimicry contexts)',4),
 ('model_kind','unknown','Unknown',5),
 ('model_kind','other','Other',6)
on conflict (vocabulary, term) do nothing;
create index if not exists idx_interaction_model_kind on mimicry_interaction(model_kind);
