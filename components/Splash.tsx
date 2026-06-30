"use client";
import { useEffect, useState } from "react";
/** Splash con HALO de luz blanca pulsante (molde aprobado). */
export default function Splash({ brand = "VMOMENTUM", ms = 1600 }:{brand?:string;ms?:number}) {
  const [hide, setHide] = useState(false);
  useEffect(() => { const id = setTimeout(() => setHide(true), ms); return () => clearTimeout(id); }, [ms]);
  return (
    <div className={"v-splash" + (hide ? " hide" : "")}>
      <div className="v-halo" /><b>{brand}</b>
    </div>
  );
}
