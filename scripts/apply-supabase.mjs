#!/usr/bin/env node
// Applies docs/supabase-setup.sql DIRECTLY over the database connection (pg simple
// query protocol) — bypasses the SQL Editor's statement splitter entirely. One
// Postgres parse of the whole file: semicolons inside strings are handled correctly.
// Requires DATABASE_URL in .env (Supabase -> Project Settings -> Database ->
// Connection string -> URI, session pooler, password filled in). SECRET: .env only.
import {readFileSync,existsSync} from 'node:fs';
import pg from 'pg';
const envPath=new URL('../.env',import.meta.url);
if(!existsSync(envPath)){console.log('apply: no .env found');process.exit(1);}
const env={};
for(const line of readFileSync(envPath,'utf8').split('\n')){
  const m=line.match(/^([A-Z_]+)=(.*)$/);
  if(m)env[m[1]]=m[2].trim();
}
if(!env.DATABASE_URL){console.log('apply: DATABASE_URL missing from .env — add the connection string from Project Settings -> Database');process.exit(1);}
const sql=readFileSync(new URL('../docs/supabase-setup.sql',import.meta.url),'utf8');
const client=new pg.Client({connectionString:env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
await client.connect();
try{
  const res=await client.query(sql);
  const n=Array.isArray(res)?res.length:1;
  console.log(`apply: success — ${n} statement result(s)`);
}catch(e){
  console.error(`apply: FAILED — ${e.message}`);
  process.exitCode=1;
}finally{
  await client.end();
}
