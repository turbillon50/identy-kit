export default function LogoMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 460" {...props}>
      <defs>
        <linearGradient id="accent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4FF0D8" />
          <stop offset="100%" stopColor="#129488" />
        </linearGradient>
        <linearGradient id="fretA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#26E0C4" />
          <stop offset="100%" stopColor="#16A695" />
        </linearGradient>
        <linearGradient id="fretB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6FF6E2" />
          <stop offset="100%" stopColor="#2BC9B2" />
        </linearGradient>
      </defs>
      <path
        d="M256 38 L378 76 V206 C378 298 322 358 256 392 C190 358 134 298 134 206 V76 Z"
        fill="#0b0b10"
        stroke="url(#accent)"
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <g transform="translate(176,110)">
        <path d="M0 18 h28 v28 h28 v28 h-28 v28 h-28 v-28 h-28 v-28 h28 z" fill="url(#fretA)" />
        <path d="M68 18 h28 v28 h28 v28 h-28 v28 h-28 v-28 h-28 v-28 h28 z" fill="url(#fretB)" />
      </g>
      <path
        d="M150 260 h40 l14 -32 l20 52 l16 -78 l16 58 h106"
        fill="none"
        stroke="#F3FFFC"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
      <circle cx={362} cy={260} r={6} fill="#F3FFFC" />
    </svg>
  );
}
