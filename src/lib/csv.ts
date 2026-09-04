export const csv=(headers:string[],rows:(string|number|undefined)[][])=>[headers.join(','),...rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(','))].join('\n');
