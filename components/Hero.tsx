/** Hero AURORA — halo blanco en movimiento + frío azul (cero dorado). */
export default function Hero({ title, subtitle, cta, onCta }:
  { title: React.ReactNode; subtitle?: string; cta?: string; onCta?: () => void }) {
  return (
    <section className="v-hero">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {cta && <button className="v-btn v-btn--primary" style={{ marginTop: 12, width: "fit-content", position: "relative" }} onClick={onCta}>{cta}</button>}
    </section>
  );
}
