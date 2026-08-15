"use client";
import { useState } from "react";

export default function MedicalForm({ identityId, initial, isPet }: any) {
  const [f, setF] = useState<any>({
    allergies:initial.allergies||"", conditions:initial.conditions||"", medications:initial.medications||"",
    implants:initial.implants||"", insurance:initial.insurance||"", preferred_hospital:initial.preferred_hospital||"",
    doctor_name:initial.doctor_name||"", doctor_phone:initial.doctor_phone||"", vaccinations:initial.vaccinations||"",
    dnr:!!initial.dnr, notes:initial.notes||"",
  });
  const [st,setSt]=useState("");
  const up=(k:string,v:any)=>setF((s:any)=>({...s,[k]:v}));
  const save=async()=>{ setSt("Guardando…");
    const r=await fetch("/api/medical",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity_id:identityId,...f})});
    setSt(r.ok?"Guardado ✓":"Error"); setTimeout(()=>setSt(""),1600);
  };
  return (
    <div className="card">
      <div className="field"><div className="label">Alergias</div><textarea className="input" rows={2} value={f.allergies} onChange={e=>up("allergies",e.target.value)} placeholder="Penicilina, mariscos…"/></div>
      <div className="field"><div className="label">Padecimientos</div><textarea className="input" rows={2} value={f.conditions} onChange={e=>up("conditions",e.target.value)} placeholder="Diabetes, epilepsia, marcapasos…"/></div>
      <div className="field"><div className="label">Medicamentos</div><textarea className="input" rows={2} value={f.medications} onChange={e=>up("medications",e.target.value)}/></div>
      {!isPet && <div className="field"><div className="label">Implantes / aparatos</div><input className="input" value={f.implants} onChange={e=>up("implants",e.target.value)} placeholder="Marcapasos, prótesis…"/></div>}
      {isPet && <div className="field"><div className="label">Vacunas</div><input className="input" value={f.vaccinations} onChange={e=>up("vaccinations",e.target.value)} placeholder="Rabia (vigente), …"/></div>}
      <div className="grid2">
        <div className="field"><div className="label">{isPet?"Seguro/chip":"Seguro médico"}</div><input className="input" value={f.insurance} onChange={e=>up("insurance",e.target.value)}/></div>
        <div className="field"><div className="label">{isPet?"Veterinaria":"Hospital preferido"}</div><input className="input" value={f.preferred_hospital} onChange={e=>up("preferred_hospital",e.target.value)}/></div>
      </div>
      <div className="grid2">
        <div className="field"><div className="label">{isPet?"Veterinario":"Médico"}</div><input className="input" value={f.doctor_name} onChange={e=>up("doctor_name",e.target.value)}/></div>
        <div className="field"><div className="label">Teléfono</div><input className="input" value={f.doctor_phone} onChange={e=>up("doctor_phone",e.target.value)}/></div>
      </div>
      {!isPet && <label className="row" style={{ margin:"2px 0 14px", cursor:"pointer" }}>
        <input type="checkbox" checked={f.dnr} onChange={e=>up("dnr",e.target.checked)} style={{ width:20,height:20 }}/>
        <span style={{ fontWeight:600 }}>Voluntad anticipada: No reanimar (DNR)</span>
      </label>}
      <button className="btn" onClick={save}>{st||"Guardar ficha médica"}</button>
    </div>
  );
}
