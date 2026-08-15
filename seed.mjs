import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const OWNER = 'user_3HvW8vDCEh5EPBBuAjLvq6W64hy';
const tok = () => (Math.random().toString(36).slice(2,8) + Math.random().toString(36).slice(2,8));

// limpiar cualquier siembra previa de este owner (idempotente)
const prev = await sql`select id from identities where owner_clerk_user_id=${OWNER}`;
for (const p of prev) {
  await sql`delete from found_events where identity_id=${p.id}`;
  await sql`delete from medical_info where identity_id=${p.id}`;
  await sql`delete from emergency_contacts where identity_id=${p.id}`;
}
await sql`delete from identities where owner_clerk_user_id=${OWNER}`;

async function person(o){
  const [r] = await sql`insert into identities
    (owner_clerk_user_id,kind,display_name,birth_date,blood_type,national_id,public_note,sex,organ_donor,qr_token,is_active)
    values (${OWNER},'person',${o.name},${o.birth},${o.blood},${o.curp||null},${o.note},${o.sex},${o.donor||false},${tok()},true)
    returning id`;
  return r.id;
}
async function pet(o){
  const [r] = await sql`insert into identities
    (owner_clerk_user_id,kind,display_name,species,breed,color,birth_date,public_note,owner_name,owner_phone,microchip,reward_note,qr_token,is_active)
    values (${OWNER},'pet',${o.name},${o.species},${o.breed},${o.color},${o.birth},${o.note},${o.owner},${o.phone},${o.chip||null},${o.reward||null},${tok()},true)
    returning id`;
  return r.id;
}
const med = (id,o)=> sql`insert into medical_info
    (identity_id,allergies,conditions,medications,preferred_hospital,doctor_name,doctor_phone,notes)
    values (${id},${o.allergies||null},${o.conditions||null},${o.medications||null},${o.hospital||null},${o.doctor||null},${o.dphone||null},${o.notes||null})`;
const contact = (id,name,rel,phone,primary=false)=> sql`insert into emergency_contacts
    (identity_id,name,relationship,phone,is_primary) values (${id},${name},${rel},${phone},${primary})`;
const found = (id,note,daysAgo)=> sql`insert into found_events
    (identity_id,lat,lng,accuracy,finder_note,user_agent,created_at)
    values (${id}, ${19.4326 + (Math.random()-0.5)*0.05}, ${-99.1332 + (Math.random()-0.5)*0.05}, 30,
    ${note}, 'Mozilla/5.0 (iPhone)', now() - (${daysAgo} || ' days')::interval)`;

// 1) Adulta con condición crónica
const m1 = await person({name:'María Fernanda López', birth:'1988-03-12', blood:'O+', curp:'LOPM880312MDFPRR03',
  note:'Diabética tipo 1. Puede requerir insulina en una crisis. Avisar de inmediato a sus contactos.', sex:'F', donor:true});
await med(m1,{allergies:'Penicilina', conditions:'Diabetes tipo 1', medications:'Insulina glargina', hospital:'Hospital Ángeles del Pedregal', doctor:'Dra. Ana Ruiz', dphone:'+52 55 5210 8080', notes:'Portadora de bomba de insulina.'});
await contact(m1,'Carlos López','Esposo','+52 55 1298 4471',true);
await contact(m1,'Laura López','Hermana','+52 55 3390 1122');

// 2) Adulto mayor
const m2 = await person({name:'Don Roberto Méndez', birth:'1949-11-02', blood:'A+',
  note:'Hipertenso, portador de marcapasos. Puede desorientarse. Contactar a su hija.', sex:'M'});
await med(m2,{conditions:'Hipertensión arterial', medications:'Losartán 50mg', notes:'Marcapasos desde 2019.', hospital:'IMSS La Raza', doctor:'Dr. Jorge Salas', dphone:'+52 55 5724 5900'});
await contact(m2,'Patricia Méndez','Hija','+52 55 4415 7788',true);

// 3) Menor de edad
const m3 = await person({name:'Sofía Ramírez', birth:'2016-06-20', blood:'B+',
  note:'Menor de edad. En caso de encontrarla sola, contactar de inmediato a sus padres.', sex:'F'});
await contact(m3,'Verónica Ramírez','Mamá','+52 55 2277 9034',true);
await contact(m3,'Diego Ramírez','Papá','+52 55 8801 4567');

// 4) Mascota
const p1 = await pet({name:'Firulais', species:'Perro', breed:'Labrador', color:'Dorado', birth:'2020-01-15',
  note:'Perro guía. Dócil. Si lo encuentras, avisa a su dueña; requiere medicamento diario.',
  owner:'María Fernanda López', phone:'+52 55 1298 4471', chip:'9840001234567', reward:'Se ofrece recompensa por su regreso.'});
await contact(p1,'María Fernanda López','Dueña','+52 55 1298 4471',true);

// avisos (found) para que Actividad y KPIs tengan contenido
await found(m2,'Encontré a un señor desorientado cerca del metro Balderas. Escaneé su código.', 2);
await found(p1,'Perro dorado solo en el parque México, se ve tranquilo. Escaneando su placa QR.', 5);
await found(m1,'Aviso de prueba del sistema.', 8);

const [c] = await sql`select count(*)::int n from identities where owner_clerk_user_id=${OWNER}`;
const [f] = await sql`select count(*)::int n from found_events fe join identities i on i.id=fe.identity_id where i.owner_clerk_user_id=${OWNER}`;
console.log('OK carnets='+c.n+' avisos='+f.n);
