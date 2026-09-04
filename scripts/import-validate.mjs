#!/usr/bin/env node
// Curator CSV import pre-check (prompt.md §45): validation, duplicate warnings, error report.
// Dry-run by design — until a live database exists this NEVER writes anywhere.
// Usage: node scripts/import-validate.mjs <file.csv> [--existing export/vX.Y.Z/interactions.csv]
import {interactions} from '../src/data/demo.ts';
import {readFileSync} from 'node:fs';
import {parseCsv} from '../src/lib/csv.ts';
import {validateRow,mergeReports,HEADER} from '../src/lib/validation.ts';

const file=process.argv[2];
if(!file){console.error('usage: node scripts/import-validate.mjs <file.csv>');process.exit(2);}
const parsed=parseCsv(readFileSync(file,'utf8'));
const headers=parsed[0];
const missing=HEADER.filter(h=>!headers.includes(h));
if(missing.length){console.error(`IMPORT REJECTED — missing columns: ${missing.join(', ')}`);process.exit(1);}
const rows=parsed.slice(1).map(cells=>Object.fromEntries(headers.map((h,idx)=>[h,cells[idx]??''])));
let report={errors:[],warnings:[],duplicates:[]};
const seen=new Set();
rows.forEach((row,idx)=>{report=mergeReports(report,validateRow(row,seen,interactions,idx));});
console.log(`preview: ${rows.length} row(s) parsed from ${file}`);
console.log(`errors: ${report.errors.length} · warnings: ${report.warnings.length} · duplicate warnings: ${report.duplicates.length}`);
for(const e of report.errors)console.error(' ERROR ',e);
for(const w of report.warnings)console.warn(' warn  ',w);
for(const d of report.duplicates)console.warn(' dup   ',d);
if(report.errors.length){console.error('IMPORT REJECTED — atomic policy: nothing would be written.');process.exit(1);}
console.log('validation passed — rows eligible for the curator draft workflow (no write performed in this prototype).');
