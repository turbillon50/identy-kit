"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function IdentityForm({ identity }: { identity: any }) {
  const r = useRouter();
  const [f, setF] = useState<any>({ ...identity, birth_date: identity.birth_date ? String(identity.birth_date).slice(0,10) : "" });
  const [st, setSt] = useState(""); const [photo, setPhoto] = useState(identity.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const up = (k:string,v:any)=>setF((s:any)=>({...s,[k]:v}));
  const isPet = f.kind === "pet";

  const pickPhoto = async (e:any) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload",{method:"POST",body:fd});
    const d = await res.json(); setUploading(false);
    if(d.url){ setPhoto(d.url); up("photo_url", d.url); } else alert("No se pudo subir la foto");
  };
  const save = async () => {
    setSt("Guardando…");
    const body:any = { display_name:f.display_name, kind:f.kind, species:f.species, breed:f.breed, color:f.color, sex:f.sex, birth_date:f.birth_date, blood_type:f.blood_type, weight:f.weight, organ_donor:!!f.organ_donor, microchip:f.microchip, owner_name:f.owner_name, owner_phone:f.owner_phone, reward_note:f.reward_note, public_note:f.public_note, national_id:f.national_id, photo_url:photo };
    const res = await fetch(`/api/identities/${identity.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    setSt(res.ok?"Guardado ✓":"Error"); if(res.ok) r.refresh(); setTimeout(()=>setSt(""),1600);
  };

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 14 }}>
        <div className="avatar" style={{ width: 60, height: 60, fontSize: 26 }}>
          {photo ? <img src={photo} alt=""/> : (isPet?"🐾":"🧑")}
        </div>
        <div>
          <button className="btn ghost sm" onClick={()=>fileRef.current?.click()} disabled={uploading}>{uploading?"Subiendo…":photo?"Cambiar foto":"Subir foto"}</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto}/>
        </div>
      </div>
      <div className="field"><div className="label">Nombre</div><input className="input" value={f.display_name||""} onChange={e=>up("display_name",e.target.value)}/></div>
      <div className="grid2">
        <div className="field"><div className="label">Nacimiento</div><input className="input" type="date" value={f.birth_date||""} onChange={e=>up("birth_date",e.target.value)}/></div>
        <div className="field"><div className="label">Sexo</div><input className="input" value={f.sex||""} onChange={e=>up("sex",e.target.value)} placeholder={isPet?"Macho/Hembra":"M/F"}/></div>
      </div>
      {isPet ? (
        <div className="grid2">
          <div className="field"><div className="label">Especie/raza</div><input className="input" value={f.breed||f.species||""} onChange={e=>up("breed",e.target.value)}/></div>
          <div className="field"><div className="label">Color/señas</div><input className="input" value={f.color||""} onChange={e=>up("color",e.target.value)}/></div>
        </div>
      ) : (
        <div className="grid2">
          <div className="field"><div className="label">Tipo de sangre</div><input className="input" value={f.blood_type||""} onChange={e=>up("blood_type",e.target.value)} placeholder="O+"/></div>
          <div className="field"><div className="label">Peso</div><input className="input" value={f.weight||""} onChange={e=>up("weight",e.target.value)} placeholder="70 kg"/></div>
        </div>
      )}
      {isPet && <div className="grid2">
        <div className="field"><div className="label">Microchip</div><input className="input" value={f.microchip||""} onChange={e=>up("microchip",e.target.value)}/></div>
        <div className="field"><div className="label">Tel. dueño</div><input className="input" value={f.owner_phone||""} onChange={e=>up("owner_phone",e.target.value)}/></div>
      </div>}
      {isPet && <div className="field"><div className="label">Recompensa si lo encuentran</div><input className="input" value={f.reward_note||""} onChange={e=>up("reward_note",e.target.value)} placeholder="Ej: $1,000 de recompensa"/></div>}
      {!isPet && <label className="row" style={{ margin: "2px 0 14px", cursor:"pointer" }}>
        <input type="checkbox" checked={!!f.organ_donor} onChange={e=>up("organ_donor",e.target.checked)} style={{ width:20,height:20 }}/>
        <span style={{ fontWeight:600 }}>Soy donante de órganos 💚</span>
      </label>}
      <div className="field"><div className="label">Nota crítica (visible en emergencia)</div><textarea className="input" rows={2} value={f.public_note||""} onChange={e=>up("public_note",e.target.value)} placeholder="Ej: diabético, no mover el cuello"/></div>
      <button className="btn" onClick={save}>{st||"Guardar datos"}</button>
    </div>
  );
}
