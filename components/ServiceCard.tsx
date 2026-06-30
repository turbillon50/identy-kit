/** Tarjeta de servicio + variante con badge/rating (molde aprobado). */
export default function ServiceCard({ title, desc, badge, rating }:
  { title: string; desc?: string; badge?: string; rating?: string }) {
  return (
    <article className="v-card">
      <div className="ph" />
      {badge ? (
        <div className="row"><h4>{title}</h4><span className="v-badge">{badge}</span></div>
      ) : <h4>{title}</h4>}
      {rating ? <p className="v-star">★ {rating}</p> : desc && <p>{desc}</p>}
    </article>
  );
}
