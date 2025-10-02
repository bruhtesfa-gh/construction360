import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center space-x-2">
      <Image
        src="/logo_house.png"
        alt="My Construction App Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="text-2xl font-bold text-slate-900">
        My Construction App
      </span>
    </Link>
  );
}
