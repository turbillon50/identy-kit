/** i18n mínimo, ESPAÑOL POR DEFECTO. Reemplazar por next-intl/i18next en apps grandes. */
export const DEFAULT_LOCALE = "es";
type Dict = Record<string, string>;
const dicts: Record<string, Dict> = {
  es: { "nav.home":"Inicio","nav.search":"Buscar","nav.create":"Crear","nav.activity":"Actividad","nav.profile":"Perfil" },
  en: { "nav.home":"Home","nav.search":"Search","nav.create":"Create","nav.activity":"Activity","nav.profile":"Profile" },
};
let locale = DEFAULT_LOCALE;
export const setLocale = (l: string) => { locale = dicts[l] ? l : DEFAULT_LOCALE; };
export const t = (k: string) => (dicts[locale] && dicts[locale][k]) || dicts.es[k] || k;
