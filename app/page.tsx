import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-in">
          <div className="lp-logo"><img src="/icon-192.png" alt="" /> Identy·kit</div>
          <SignInButton mode="modal"><button className="lp-navbtn ghost">Entrar</button></SignInButton>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-in">
          <img className="lock" src="/logo.png" alt="Identy-Kit" />
          <span className="lp-eyebrow">Identidad de emergencia con QR</span>
          <h1 className="lp-title">Si algo pasa, tu información <span>salva minutos</span></h1>
          <p className="lp-lede">
            Un carnet digital con código QR para ti, tu familia y tus mascotas.
            Quien esté cerca escanea y ve al instante tu tipo de sangre, alergias,
            padecimientos y a quién llamar. Sin instalar apps, sin claves.
          </p>
          <div className="lp-cta">
            <SignUpButton mode="modal"><button className="btn">Crear mi carnet</button></SignUpButton>
            <a href="#como" className="btn ghost">Ver cómo funciona</a>
          </div>
          <div className="lp-trust">
            <span>✓ Sin instalar apps</span>
            <span>✓ Listo en 2 minutos</span>
            <span>✓ Tú decides qué se ve</span>
          </div>
        </div>
      </header>

      {/* PARA QUIÉN */}
      <div className="lp-in">
        <div className="lp-chips">
          <span className="lp-chip">🧑 Para ti</span>
          <span className="lp-chip">👨‍👩‍👧 Tu familia</span>
          <span className="lp-chip">🧓 Adultos mayores</span>
          <span className="lp-chip">🧒 Niños</span>
          <span className="lp-chip">🐾 Mascotas</span>
          <span className="lp-chip">✈️ Viajes</span>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="lp-sec" id="como">
        <div className="lp-in">
          <div className="lp-kicker">Cómo funciona</div>
          <h2 className="lp-h2">Tres pasos y quedas protegido</h2>
          <p className="lp-p">No necesitas conocimientos técnicos. Lo armas una vez y te acompaña siempre.</p>
          <div className="lp-steps">
            <div className="lp-step"><div className="n">1</div><h4>Crea el carnet</h4><p>Registra datos vitales, ficha médica y a quién llamar. Uno por cada persona o mascota.</p></div>
            <div className="lp-step"><div className="n">2</div><h4>Recibe tu QR</h4><p>Imprímelo para la cartera, el collar de tu mascota, la mochila del niño o pégalo en casa.</p></div>
            <div className="lp-step"><div className="n">3</div><h4>En una emergencia</h4><p>Quien lo escanea ve tu ficha, llama a tu contacto con un toque o marca al 911 al instante.</p></div>
          </div>
        </div>
      </section>

      {/* QUÉ VE QUIEN TE ENCUENTRA */}
      <section className="lp-sec alt">
        <div className="lp-in">
          <div className="lp-demo">
            <div className="txt">
              <div className="lp-kicker" style={{ textAlign: "left" }}>Lo que ve quien te encuentra</div>
              <h3>Toda tu info vital, sin buscar</h3>
              <p>Con un escaneo aparece una ficha clara, hecha para actuar rápido: sangre, alergias y a quién llamar, con botones de llamada directa.</p>
              <ul>
                <li>🩸 <span><b>Tipo de sangre</b> y si eres donante, visibles al instante</span></li>
                <li>⚠️ <span><b>Alergias y padecimientos</b> destacados para el paramédico</span></li>
                <li>📞 <span><b>Llamada de un toque</b> a tus contactos y al 911</span></li>
                <li>📍 <span><b>“Lo encontré”</b>: quien te halla comparte su ubicación contigo</span></li>
              </ul>
            </div>
            <div className="mock">
              <div className="mb">🆘 FICHA DE EMERGENCIA</div>
              <div className="mbody">
                <div className="mtop">
                  <div className="mph">🧑</div>
                  <div>
                    <div className="mname">Carlos M.</div>
                    <div className="mrow">
                      <span className="mtag red">🩸 A+</span>
                      <span className="mtag gray">Donante</span>
                    </div>
                  </div>
                </div>
                <div className="mrow" style={{ marginBottom: 12 }}>
                  <span className="mtag red">Alergia: Penicilina</span>
                  <span className="mtag gray">Diabético</span>
                </div>
                <div className="mcall"><span>📞 Llamar a Marisol (esposa)</span><span>›</span></div>
                <div className="mcall r"><span>🚑 Emergencias 911</span><span>›</span></div>
                <div className="mfound">📍 Avisar que lo encontré</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="lp-sec">
        <div className="lp-in">
          <div className="lp-kicker">Todo lo que incluye</div>
          <h2 className="lp-h2">Pensado para el momento que importa</h2>
          <div className="lp-feats" style={{ marginTop: 30 }}>
            <div className="lp-feat"><div className="ic">🩺</div><h4>Ficha médica completa</h4><p>Sangre, alergias, padecimientos, medicamentos, implantes, hospital y seguro.</p></div>
            <div className="lp-feat"><div className="ic">📱</div><h4>QR sin apps</h4><p>Cualquiera lo escanea con la cámara del teléfono. No hay que instalar ni registrarse.</p></div>
            <div className="lp-feat"><div className="ic">🐾</div><h4>Personas y mascotas</h4><p>Un carnet por cada quien, todos en tu misma cuenta. Chip, vacunas y recompensa incluidos.</p></div>
            <div className="lp-feat"><div className="ic">📍</div><h4>Aviso con ubicación</h4><p>Si encuentran a tu familiar o mascota, te llega dónde están con enlace al mapa.</p></div>
            <div className="lp-feat"><div className="ic">🖨️</div><h4>Tarjeta imprimible</h4><p>Formato cartera con tu QR para llevar siempre contigo o en el collar.</p></div>
            <div className="lp-feat"><div className="ic">🔒</div><h4>Privado y tuyo</h4><p>Tú decides qué información es pública. Editas o borras cuando quieras.</p></div>
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section className="lp-sec alt">
        <div className="lp-in">
          <div className="lp-kicker">Ideal para</div>
          <h2 className="lp-h2">Cuando más se necesita</h2>
          <p className="lp-p">Un pequeño detalle que hace enorme diferencia en un accidente, una recaída o un extravío.</p>
          <div className="lp-uses">
            <span className="lp-use">🏃 Corredores y ciclistas</span>
            <span className="lp-use">🧓 Adultos mayores</span>
            <span className="lp-use">🧒 Niños pequeños</span>
            <span className="lp-use">🐕 Mascotas que se pierden</span>
            <span className="lp-use">💊 Condiciones crónicas</span>
            <span className="lp-use">✈️ Viajeros</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-sec">
        <div className="lp-in">
          <div className="lp-kicker">Preguntas</div>
          <h2 className="lp-h2">Lo que la gente pregunta</h2>
          <div className="lp-faq" style={{ marginTop: 28 }}>
            <details><summary>¿Quien me encuentra necesita instalar algo?</summary><p>No. Escanea el QR con la cámara del teléfono y se abre tu ficha en el navegador. Cero apps, cero cuentas.</p></details>
            <details><summary>¿Puedo tener varios carnets?</summary><p>Sí. Con una sola cuenta manejas los carnets de toda tu familia y de tus mascotas, cada uno con su propio QR.</p></details>
            <details><summary>¿Qué pasa si pierdo el QR impreso?</summary><p>Entras a tu cuenta y lo vuelves a imprimir cuando quieras. Tu información sigue segura y actualizada.</p></details>
            <details><summary>¿Mis datos son privados?</summary><p>Tú controlas qué se muestra en la ficha pública. Los datos que marques como privados solo los ves tú al entrar.</p></details>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="lp-in">
        <div className="lp-final">
          <h2>Protege a quien más quieres</h2>
          <p>Créalo hoy en un par de minutos. Para ti, tu familia y tus mascotas.</p>
          <SignUpButton mode="modal"><button className="btn">Crear mi carnet</button></SignUpButton>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-foot">
        <div><img src="/icon-192.png" alt="" /> Identy·kit — Tu identidad, segura en un QR</div>
        <div style={{ marginTop: 8 }}>© {new Date().getFullYear()} · Hecho para cuidarte</div>
      </footer>
    </div>
  );
}
