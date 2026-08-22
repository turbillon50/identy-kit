/**
 * Lo que se ve mientras el servidor prepara una pantalla. Antes era un
 * parpadeo en blanco; ahora es la marca respirando un segundo.
 */
export default function Cargando() {
  return (
    <div className="splash" role="status" aria-label="Cargando">
      <img src="/logo.png" alt="Identy-Kit" />
      <div className="splash-barra"><span /></div>
    </div>
  );
}
