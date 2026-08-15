"use client";
import { useState } from "react";

export default function QrShare({ url, svg }:{ url:string; svg:string }) {
  const [msg,setMsg]=useState("");
  function flash(t:string){ setMsg(t); setTimeout(()=>setMsg(""),1800); }

  async function compartir(){
    try{
      if(navigator.share){ await navigator.share({title:"Ficha de emergencia",text:"Escanea o abre para ver mi ficha de emergencia",url}); }
      else { await navigator.clipboard.writeText(url); flash("Enlace copiado"); }
    }catch{}
  }
  async function copiar(){ try{ await navigator.clipboard.writeText(url); flash("Enlace copiado"); }catch{} }
  function descargar(){
    const blob=new Blob([svg],{type:"image/svg+xml"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download="qr-identykit.svg"; a.click();
    URL.revokeObjectURL(a.href); flash("QR descargado");
  }

  return (
    <div style={{width:"100%"}}>
      <div className="qractions">
        <a href={url} target="_blank" className="btn ghost">Ver ficha</a>
        <button className="btn" onClick={compartir}>Compartir</button>
        <button className="btn ghost" onClick={descargar}>Descargar QR</button>
        <button className="btn ghost" onClick={copiar}>Copiar enlace</button>
      </div>
      {msg && <div className="sub" style={{textAlign:"center",marginTop:8,color:"var(--ok)",fontWeight:700}}>{msg}</div>}
    </div>
  );
}
