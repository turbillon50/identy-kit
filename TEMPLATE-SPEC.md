# MASTER STARTER — MOLDE MAESTRO APROBADO (v3.0)

> Aprobado en vivo por Luis el 2026-06-22 (lo vio en http://178.105.135.26/molde/).
> Fuente de verdad del estilo: `/var/www/html/molde/index.html`.
> Toda app/demo NACE clonando este starter. PROHIBIDO improvisar o clonar templates viejos.

## Marca (variantes aprobadas)
- **Obsidian oscuro** `--bg:#08080c` (NUNCA `#000`) + **halo de luz BLANCA**. CERO dorado.
- Glass/cristal (`backdrop-filter: blur(16px) saturate(140%)`).
- Íconos SVG PROPIOS. CERO lucide.

## Componentes horneados (reflejan el molde aprobado)
- `styles/tokens.css` — paleta exacta del molde, glass, motion sobrio, reduced-motion, clases `v-*`.
- `components/BottomNav.tsx` — **tab bar GLASS fija** (hermana del scroll, safe-area, navega de verdad).
  Variante con **botón central** (`center:true`) para apps con acción principal.
  Emite `data-vulcano-bottomnav` (el gate lo verifica).
- `components/Splash.tsx` — **halo de luz blanca pulsante**.
- `components/Header.tsx` — **header con avatar** (abre bottom sheet).
- `components/Hero.tsx` — **hero AURORA** (halo blanco en movimiento + frío azul, cero dorado).
- `components/Field.tsx` — inputs de **etiqueta flotante**.
- `components/ServiceCard.tsx` — tarjeta de servicio + **variante badge/rating**.
- `components/Sheet.tsx` — **bottom sheet**.
- `components/icons.tsx` — set de íconos PROPIO. CERO lucide.
- `lib/i18n.ts` — ESPAÑOL por defecto + diccionario es/en.
- `app/layout.snippet.tsx` — `<html lang="es">` + tokens + splash + barra fija + `viewportFit:cover`.

## Reglas duras
1. Sin toggle/switch de 3 modos (Público/Cliente/Admin). Roles = rutas con auth real.
2. CERO `import ... from "lucide-react"`.
3. Estas son las VARIANTES POR DEFECTO: tab bar glass, splash halo, hero aurora, form floating,
   card badge/rating, header+sheet. Marca = obsidian + halo BLANCO.
4. Deploy SIEMPRE al dominio real (no *.vercel.app). Verificar SOBRE el dominio.
5. Antes de "listo": `bash /root/vulcano-templates/verify-gate.sh <dominio>` en VERDE.

## Cómo arrancar
1. `cp -r /root/vulcano-templates/master-starter/* <app>/src/` (o adaptar a app router).
2. Añadir `manifest.webmanifest`, íconos PWA 192/512 maskable, SW.
3. Páginas legales desde `/root/vulcano-templates/legal/`.
4. Sembrar datos plausibles (Neon). Deploy a dominio. Correr el gate.

> Referencia visual viva permanente: http://178.105.135.26/molde/
