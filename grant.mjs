import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const TOKEN = process.env.TK;
const OWNER = 'user_3HvW8vDCEh5EPBBuAjLvq6W64hy';
await sql`create table if not exists access_grants (
  token text primary key,
  owner_clerk_user_id text not null,
  label text,
  is_active boolean default true,
  created_at timestamptz default now()
)`;
await sql`delete from access_grants where owner_clerk_user_id=${OWNER}`;
await sql`insert into access_grants (token, owner_clerk_user_id, label) values (${TOKEN}, ${OWNER}, 'Marisol')`;
const [r] = await sql`select label, left(token,8)||'…' tk from access_grants where owner_clerk_user_id=${OWNER}`;
console.log('GRANT OK label='+r.label+' token='+r.tk);
