export function completeness(id: any, med: any, contactsCount: number): number {
  const checks = [
    !!id.display_name, !!id.photo_url, !!id.blood_type || id.kind !== "person",
    !!(med?.allergies || med?.conditions), !!(med?.medications),
    contactsCount > 0, !!id.public_note || !!id.emergency_message,
    id.kind === "pet" ? !!id.owner_phone : !!(med?.preferred_hospital || med?.doctor_name),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
export function ageFrom(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr); if (isNaN(+d)) return "";
  const diff = Date.now() - d.getTime();
  const y = Math.floor(diff / 31557600000);
  return y > 0 ? `${y} años` : `${Math.max(0, Math.floor(diff / 2629800000))} meses`;
}
