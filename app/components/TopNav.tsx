"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function TopNav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `font-semibold text-white m-0 p-0`;

  return (
    <div className="flex bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 shadow-lg rounded-b-xl mx-2 mt-2">
      <div className="flex items-center gap-0 m-0 p-0 w-full justify-end">
        <Link href="/clash" className={linkClass("/clash") + " text-white m-0 p-0"}> 
          <Image
            src="/clash-logo.png"
            alt="Clash"
            width={100}
            height={32}
            priority
            style={{ borderRadius: '0.4rem' }}
          />
        </Link>

        <Link href="/cases" className={linkClass("/cases") + " m-0 p-0"}> 
          <Image
            src="/cases-logo.png"
            alt="Cases"
            width={100}
            height={32}
            priority
            style={{ borderRadius: '0.4rem' }}
          />
        </Link>

        <Link href="/roobet" className={linkClass("/roobet") + " m-0 p-0"}> 
          <Image
            src="/roobet-logo.png"
            alt="Roobet"
            width={100}
            height={32}
            priority
            unoptimized
            style={{ borderRadius: '0.4rem' }}
          />
        </Link>

        <Link href="/roobet2" className={linkClass("/roobet2") + " text-lg m-0 p-0"}> 
          ROOBETS SPORTS
        </Link>
      </div>
    </div>
  );
}

