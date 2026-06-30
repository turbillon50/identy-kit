/** Input/Textarea de ETIQUETA FLOTANTE (molde aprobado). */
export default function Field({ label, textarea, ...props }:
  { label: string; textarea?: boolean } & React.InputHTMLAttributes<any>) {
  return (
    <label className="v-float">
      <span>{label}</span>
      {textarea
        ? <textarea placeholder=" " {...(props as any)} />
        : <input placeholder=" " {...props} />}
    </label>
  );
}
