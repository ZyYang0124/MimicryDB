export const csv=(headers:string[],rows:(string|number|undefined)[][])=>[headers.join(','),...rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(','))].join('\n');
/** Minimal RFC4180-style CSV reader (quotes, escaped quotes, CRLF) for curator import previews. */
export const parseCsv=(text:string):string[][]=>{const rows:string[][]=[];let row:string[]=[],cell='',inQ=false;
  for(let p=0;p<text.length;p++){const c=text[p];
    if(inQ){if(c==='"'){if(text[p+1]==='"'){cell+='"';p++;}else inQ=false;}else cell+=c;}
    else if(c==='"')inQ=true;
    else if(c===','){row.push(cell);cell='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[p+1]==='\n')p++;row.push(cell);cell='';if(row.length>1||row[0]!=='')rows.push(row);row=[];}
    else cell+=c;}
  if(cell!==''||row.length>0){row.push(cell);if(row.length>1||row[0]!=='')rows.push(row);}
  return rows;};
