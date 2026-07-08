export default function ProfileProgress({ percent }: { percent: number }) {
  return (
    <div className="mx-4 mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Perfil completo</p>
        <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>{percent}%</p>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e5e9f0" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #1e63d0, #2fa8e6)",
          }}
        />
      </div>
    </div>
  );
}
