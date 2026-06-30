"use client";
/** Bottom sheet (perfil / acciones). Controlado por `open`. */
export default function Sheet({ open, onClose, children }:
  { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className={"v-sheet-ov" + (open ? " on" : "")} onClick={onClose} />
      <div className={"v-sheet" + (open ? " on" : "")} role="dialog" aria-modal="true">
        <div className="grab" />{children}
      </div>
    </>
  );
}
