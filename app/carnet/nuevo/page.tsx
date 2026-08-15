"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Nuevo() {
  const r = useRouter();
  const [f, setF] = useState({ kind:"person", display_name:"", species:"", birth_date:"", blood_type:"", national_id:"", public_note:"" });
  const [loading, setLoading] = useState(false);
  const up = (k:string,v:string)=>setF(s=>({...s,[k]:v}));
  const save = async () => {
    if(!f.display_name.trim()) return alert("Ponle un nombre al carnet");
    setLoading(true);
    const res = await fetch("/api/identities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});
    const d = await res.json();
    if(d.id) r.push(`/carnet/${d.id}`); else { setLoading(false); alert("Error al guardar"); }
  };
  return (
    <div className="wrap">
      <div className="top"><Link href="/dashboard" className="sub">‹ Cancelar</Link><b>Nuevo carnet</b><span/></div>
      <div className="card">
        <div className="field"><div className="label">Tipo</div>
          <select className="input" value={f.kind} onChange={e=>up("kind",e.target.value)}>
            <option value="person">Persona</option>
            <option value="pet">Mascota</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div className="field"><div className="label">Nombre</div><input className="input" value={f.display_name} onChange={e=>up("display_name",e.target.value)} placeholder={f.kind==="pet"?"Nombre de la mascota":"Nombre completo"}/></div>
        {f.kind==="pet" && <div className="field"><div className="label">Especie / raza</div><input className="input" value={f.species} onChange={e=>up("species",e.target.value)} placeholder="Perro, Labrador"/></div>}
        <div className="field"><div className="label">Fecha de nacimiento</div><input className="input" type="date" value={f.birth_date} onChange={e=>up("birth_date",e.target.value)}/></div>
        <div className="field"><div className="label">Tipo de sangre</div><input className="input" value={f.blood_type} onChange={e=>up("blood_type",e.target.value)} placeholder="O+"/></div>
        <div className="field"><div className="label">Nota pública (visible en emergencia)</div><textarea className="input" rows={2} value={f.public_note} onChange={e=>up("public_note",e.target.value)} placeholder="Ej: diabético, no mover el cuello"/></div>
        <button className="btn" onClick={save} disabled={loading}>{loading?"Guardando…":"Crear carnet"}</button>
      </div>
    </div>
  );
}
