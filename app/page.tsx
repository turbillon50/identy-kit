import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

/**
 * La portada.
 *
 * Quien llega aquí no sabe qué es esto. Tiene que entenderlo antes de bajar:
 * si algo te pasa, alguien escanea un código y sabe a quién llamar.
 *
 * Por eso el protagonista no es una lista de funciones, sino la ficha misma —
 * una muestra de lo que vería un desconocido. Es más claro enseñarla que
 * explicarla.
 */
export default async function Portada() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="lp">
      <nav className="lp-nav">
        <span className="lp-logo">
          <img />
          Identy·kit
        </span>
        <SignInButton mode="modal">
          <button className="btn ghost sm">Entrar</button>
        </SignInButton>
      </nav>

      <header className="lp-hero">
        <div className="lp-in">
          <span className="lp-eyebrow">Tu identidad, segura en un QR</span>
          <h1 className="lp-title">
            Si algo te pasa,<br />alguien va a saber <em>a quién llamar</em>
          </h1>
          <p className="lp-lede">
            Un carnet con código QR para ti, tu familia y tus mascotas. Quien esté
            cerca lo escanea y ve tu tipo de sangre, tus alergias y el teléfono de
            los tuyos. Sin instalar nada, sin contraseñas.
          </p>
          <div className="lp-cta">
            <SignUpButton mode="modal">
              <button className="btn">Crear mi carnet</button>
            </SignUpButton>
            <a href="#como" className="btn ghost" style={{ width: "auto", padding: "15px 30px" }}>
              Ver cómo funciona
            </a>
          </div>

          {/* Lo que vería quien escanea. Enseñarlo explica mejor que describirlo. */}
          <div className="mock" aria-label="Ejemplo de una ficha de emergencia">
            <div className="banda">🚨 FICHA DE EMERGENCIA</div>
            <div className="cuerpo">
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div className="e-foto" style={{ width: 56, height: 56, fontSize: 25 }}>🧑</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }}>
                    María Fernanda L.
                  </div>
                  <div style={{ fontSize: 13, color: "var(--gris)", fontWeight: 600 }}>
                    38 años · F
                  </div>
                </div>
                <div className="e-sangre" style={{ minWidth: 66, padding: "9px 8px" }}>
                  <span className="n" style={{ fontSize: 26 }}>O+</span>
                  <span className="t" style={{ fontSize: 8 }}>Sangre</span>
                </div>
              </div>
              <div className="e-critico" style={{ marginTop: 12, padding: "11px 13px" }}>
                <div className="t" style={{ fontSize: 10 }}>Antes de atender</div>
                <div className="c" style={{ fontSize: 13.5 }}>
                  Alérgica a penicilina · Diabetes tipo 1
                </div>
              </div>
              <div className="e-llamar" style={{ marginTop: 11, minHeight: 52, padding: "11px 14px" }}>
                <span>
                  <span className="quien" style={{ fontSize: 14.5 }}>Carlos López</span>
                  <span className="rel" style={{ fontSize: 11.5 }}>Esposo</span>
                </span>
                <span className="accion" style={{ fontSize: 12.5, padding: "7px 12px" }}>Llamar</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="lp-sec" id="como">
        <div className="lp-in">
          <h2 className="lp-h2">Cómo funciona</h2>
          <p className="lp-p">
            Se hace una vez y queda listo. Después solo lo actualizas cuando algo
            cambie.
          </p>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="n">1</div>
              <h4>Llenas tu carnet</h4>
              <p>
                Tu tipo de sangre, tus alergias, lo que tomas y a quién avisar.
                Solo lo que de verdad importa en una emergencia.
              </p>
            </div>
            <div className="lp-step">
              <div className="n">2</div>
              <h4>Imprimes tu código</h4>
              <p>
                Lo llevas en la cartera, pegado atrás del celular, o en la placa
                de tu perro. También lo puedes guardar en tu teléfono.
              </p>
            </div>
            <div className="lp-step">
              <div className="n">3</div>
              <h4>Alguien lo escanea</h4>
              <p>
                Con la cámara de cualquier teléfono. No necesita instalar nada ni
                tener cuenta. Ve tus datos y puede llamar de un toque.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-sec">
        <div className="lp-in">
          <h2 className="lp-h2">Para quién sirve</h2>
          <div className="lp-uses">
            <div className="lp-use">
              <b>Si vives con algo</b>
              <span>Diabetes, epilepsia, alergias graves, marcapasos. Que no tengan que adivinar.</span>
            </div>
            <div className="lp-use">
              <b>Para tus papás</b>
              <span>Si salen solos o viven aparte, y toman medicamentos que otro debería conocer.</span>
            </div>
            <div className="lp-use">
              <b>Para los niños</b>
              <span>En la mochila o la lonchera. Si se pierden, quien los encuentre llama enseguida.</span>
            </div>
            <div className="lp-use">
              <b>Para tu perro o gato</b>
              <span>En su placa. Si se sale, quien lo halle ve tu teléfono sin tener que buscarte.</span>
            </div>
            <div className="lp-use">
              <b>Si sales a correr o rodar</b>
              <span>Cuando entrenas solo y no llevas cartera ni identificación encima.</span>
            </div>
            <div className="lp-use">
              <b>Si viajas</b>
              <span>Lejos de casa, donde nadie sabe tu historial ni a quién avisarle.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-sec">
        <div className="lp-in">
          <h2 className="lp-h2">Tus datos, tuyos</h2>
          <p className="lp-p">
            El código solo muestra lo que tú decidas poner. Tu dirección, tus
            documentos y tu historial completo quedan detrás de tu cuenta, y ahí
            nadie entra sin tu permiso.
          </p>
          <p className="lp-p" style={{ marginTop: 14 }}>
            Puedes apagar un carnet cuando quieras: el código deja de abrir en ese
            momento. Y si alguien lo escanea, tú te enteras de cuándo y dónde.
          </p>
        </div>
      </section>

      <section className="lp-final">
        <h2>Se hace en cinco minutos</h2>
        <p>
          Y ojalá nunca haga falta. Pero si hace falta, va a estar ahí.
        </p>
        <SignUpButton mode="modal">
          <button className="btn">Crear mi carnet</button>
        </SignUpButton>
      </section>

      <footer className="lp-foot">
        Identy·kit — Tu identidad, segura en un QR
      </footer>
    </div>
  );
}
