export type Interaction={id:string;mimic:string;model:string;receiver:string;type:string;evidence:string;kingdoms:string;summary:string;reference:string};
export const interactions:Interaction[]=[
{id:'MIMICRY:000001',mimic:'Myia fugax',model:'Formicidae',receiver:'predator',type:'Batesian mimicry',evidence:'E2',kingdoms:'Animalia → Animalia',summary:'A hoverfly resembles an ant in morphology and behaviour.',reference:'Demo record — sample data'},
{id:'MIMICRY:000002',mimic:'Ophrys apifera',model:'female bee',receiver:'male bee',type:'sexual deception',evidence:'E3',kingdoms:'Plantae → Animalia',summary:'The orchid flower mimics a female bee to attract pollinating males.',reference:'Demo record — sample data'},
{id:'MIMICRY:000003',mimic:'Erythrolamprus aesculapii',model:'Micrurus',receiver:'predator',type:'Batesian mimicry',evidence:'E2',kingdoms:'Animalia → Animalia',summary:'A harmless snake resembles a venomous coral snake.',reference:'Demo record — sample data'}];
