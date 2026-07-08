import Image from "next/image";

export default function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Identy-Kit"
      width={200}
      height={200}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}
