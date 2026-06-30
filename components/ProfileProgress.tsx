export default function ProfileProgress({ percent }: { percent: number }) {
  return (
    <div className="mx-4 mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-gray-400">Perfil completo</p>
        <p className="text-xs text-accent font-medium">{percent}%</p>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #149D90, #1FD1B8, #6FF6E2)",
          }}
        />
      </div>
    </div>
  );
}
