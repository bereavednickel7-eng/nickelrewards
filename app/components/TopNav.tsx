"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `transition ${
      pathname === href
        ? "opacity-100"
        : "opacity-50 hover:opacity-100"
    }`;

  return (
    <div className="flex justify-center border-b border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-8 py-4">
        <Link href="/clash" className={linkClass("/clash")}>
          <Image
            src="/clash-logo.png"
            alt="Clash"
            width={100}
            height={32}
            priority
          />
        </Link>

        <Link href="/cases" className={linkClass("/cases")}>
          <Image
            src="/cases-logo.png"
            alt="Cases"
            width={100}
            height={32}
            priority
          />
        </Link>

        <Link href="/roobet" className={linkClass("/roobet")}>
          <Image
            src="/roobet-logo.png"
            alt="Roobet"
            width={100}
            height={32}
            priority
            unoptimized
          />
        </Link>
      </div>
    </div>
  );
}

