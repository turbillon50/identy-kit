/**
 * Qué tan útil sería este carnet si alguien lo escaneara ahorita.
 *
 * No se mide "qué tan lleno está" sino "qué tanto sirve": un carnet con foto
 * y fecha de nacimiento pero sin a quién llamar no sirve de nada, y uno sin
 * foto pero con sangre, alergias y dos teléfonos sirve muchísimo.
 *
 * Por eso cada cosa pesa distinto, y se devuelve además QUÉ falta, para poder
 * decírselo al titular en vez de solo enseñarle un porcentaje.
 */
export type Pendiente = { que: string; porque: string; peso: number };

export function revisar(id: any, med: any, cuantosContactos: number) {
  const esMascota = id?.kind === "pet";
  const faltantes: Pendiente[] = [];

  const pedir = (cumple: boolean, que: string, porque: string, peso: number) => {
    if (!cumple) faltantes.push({ que, porque, peso });
    return cumple ? peso : 0;
  };

  let punteo = 0;
  const total = esMascota ? 100 : 100;

  if (esMascota) {
    punteo += pedir(cuantosContactos > 0 || !!id.owner_phone, "un teléfono tuyo",
      "Sin esto, quien lo encuentre no tiene cómo avisarte.", 45);
    punteo += pedir(!!id.photo_url, "una foto suya",
      "Ayuda a confirmar que es tu mascota.", 20);
    punteo += pedir(!!(id.breed || id.species || id.color), "cómo es",
      "Raza y color, para reconocerlo.", 15);
    punteo += pedir(!!id.microchip, "su microchip",
      "Sirve si lo llevan a una veterinaria.", 10);
    punteo += pedir(!!(med?.conditions || med?.medications || id.public_note),
      "si necesita algún cuidado",
      "Medicamento diario, si es agresivo con extraños, si está en tratamiento.", 10);
  } else {
    punteo += pedir(cuantosContactos > 0, "a quién llamar",
      "Es lo más importante. Sin esto el carnet casi no sirve.", 40);
    punteo += pedir(!!id.blood_type, "tu tipo de sangre",
      "Es lo primero que pregunta un paramédico.", 25);
    punteo += pedir(!!(med?.allergies || med?.conditions), "tus alergias o padecimientos",
      "Para que no te den algo que te haga daño.", 20);
    punteo += pedir(!!med?.medications, "qué medicamentos tomas",
      "Pueden reaccionar con lo que te apliquen.", 10);
    punteo += pedir(!!id.photo_url, "una foto",
      "Para confirmar que el carnet es tuyo.", 5);
  }

  return {
    pct: Math.round((punteo / total) * 100),
    faltantes: faltantes.sort((a, b) => b.peso - a.peso),
    sirve: punteo >= (esMascota ? 45 : 40), // ya tiene lo mínimo para servir
  };
}

/** Se conserva el nombre viejo por si algo más lo llama. */
export function completeness(id: any, med: any, contactsCount: number): number {
  return revisar(id, med, contactsCount).pct;
}

export function ageFrom(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(+d)) return "";
  const diff = Date.now() - d.getTime();
  const y = Math.floor(diff / 31557600000);
  return y > 0 ? `${y} años` : `${Math.max(0, Math.floor(diff / 2629800000))} meses`;
}
