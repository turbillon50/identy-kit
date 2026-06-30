"use client";
/** Header con saludo + avatar (abre bottom sheet / perfil). */
export default function Header({ hi = "Hola", name = "Vmomentum", onAvatar }:
  { hi?: string; name?: string; onAvatar?: () => void }) {
  return (
    <header className="v-hd">
      <div><div className="t">{hi}</div><div className="n">{name}</div></div>
      <button className="v-avatar" aria-label="Perfil" onClick={onAvatar} />
    </header>
  );
}
