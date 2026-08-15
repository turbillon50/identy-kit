"use client";
import { useState } from "react";

export default function ContactsPanel({ identityId, initial }: any) {
  const [list, setList] = useState<any[]>(initial||[]);
  const [f, setF] = useState({ name:"", relationship:"", phone:"" });
  const up = (k:string,v:string)=>setF(s=>({...s,[k]:v}));
  const add = async () => {
    if(!f.name.trim()||!f.phone.trim()) return alert("Nombre y teléfono son obligatorios");
    const r = await fetch("/api/contacts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity_id:identityId,...f})});
    const d = await r.json();
    if(d.id){ setList(l=>[...l,d]); setF({name:"",relationship:"",phone:""}); }
  };
  const del = async (id:string) => {
    await fetch(`/api/contacts?id=${id}`,{method:"DELETE"});
    setList(l=>l.filter(x=>x.id!==id));
  };
  return (
    <div className="card">
      {list.map(c=>(
        <div key={c.id} className="kv">
          <div><div className="v" style={{textAlign:"left"}}>{c.name}</div><div className="k">{c.relationship} · {c.phone}</div></div>
          <button className="pill" onClick={()=>del(c.id)}>Quitar</button>
        </div>
      ))}
      <div className="grid" style={{marginTop:list.length?14:0}}>
        <input className="input" placeholder="Nombre" value={f.name} onChange={e=>up("name",e.target.value)}/>
        <input className="input" placeholder="Parentesco (mamá, dueño…)" value={f.relationship} onChange={e=>up("relationship",e.target.value)}/>
        <input className="input" placeholder="Teléfono" value={f.phone} onChange={e=>up("phone",e.target.value)}/>
        <button className="btn ghost" onClick={add}>+ Agregar contacto</button>
      </div>
    </div>
  );
}
