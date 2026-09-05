export type Lang='en'|'zh';
const en={
 nav:{interactions:'Interactions',taxa:'Taxa',mimics:'Mimics',models:'Models',references:'References',evidence:'Evidence',search:'Search',about:'About'},
 footer:{tagline:'Open scientific infrastructure',download:'Download data',curator:'Curator (demo)',langToggle:'中文'},
 demo:'DEMO / PROTOTYPE DATA',
 home:{h1:'Who mimics whom across the Tree of Life?',sub:'An open database of documented mimic–model interactions across animals, plants, fungi, and other lineages.',explore:'Explore interactions →',quick:['Browse taxa','Explore mimics','Explore models','References','Download data','About'],netTitle:'Mimic → Model',netNote:'Node size = number of sample records; teal edges are cross-kingdom interactions. A Tree-of-Life visualization is planned but deliberately not faked.'},
 common:{mimic:'Mimic',model:'Model',receiver:'Receiver',evidence:'Evidence',type:'Type',kingdoms:'Kingdoms',knowledge:'knowledge status',modelKind:'model kind',related:'Related records',provenance:'Provenance',all:'← All interactions',taxaAll:'← All taxa',refsAll:'← All references',notFound:'Not found'},
};
const zh={
 nav:{interactions:'交互记录',taxa:'分类单元',mimics:'模仿者',models:'模型',references:'文献',evidence:'证据等级',search:'搜索',about:'关于'},
 footer:{tagline:'开放的科学基础设施',download:'下载数据',curator:'策展台（演示）',langToggle:'English'},
 demo:'演示 / 原型数据',
 home:{h1:'谁在模仿谁？——横跨生命之树',sub:'一个开放数据库：记录动物、植物、真菌等类群中"模仿者 → 模型 | 接收者"的定向拟态关系，附完整文献溯源。',explore:'浏览交互记录 →',quick:['分类单元','模仿者排行','模型排行','文献','下载数据','关于'],netTitle:'模仿者 → 模型',netNote:'节点大小 = 样本记录数；青色连线为跨界的交互。生命之树全貌可视化已在规划中，但绝不以假乱真。'},
 common:{mimic:'模仿者',model:'模型',receiver:'接收者',evidence:'证据等级',type:'拟态类型',kingdoms:'界',knowledge:'知识状态',modelKind:'模型类别',related:'相关记录',provenance:'文献溯源',all:'← 全部交互记录',taxaAll:'← 全部分类单元',refsAll:'← 全部文献',notFound:'未找到'},
 modelKind:{organism:'物种',environment:'环境',object:'无生命对象',self:'自身',unknown:'未知',other:'其它'},
};
export const strings=(lang:Lang)=>lang==='zh'?zh:en;
/** Bilingual pages mirror paths: /MimicryDB/x/ ⇄ /MimicryDB/zh/x/ */
export const twinPath=(pathname:string,target:Lang)=>{
  const p=pathname.replace(/index\.html$/,'');
  if(target==='zh')return p.endsWith('/')?`${p.replace(/\/$/,'')}/zh/`:`${p}/zh/`;
  return p.replace(/\/zh\/?/,'/');
};
