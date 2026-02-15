// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";

export const metadata = {
  title: "NickelRewards",
  description: "Leaderboards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-zinc-50 via-[#24172A] to-[#2d2036]">
        {/* Top nav */}
        <header className="w-full shadow-md sticky top-0 z-30" style={{ background: '#24172A' }}>
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            {/* Logo and Socials */}
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/clash" className="flex items-center gap-3">
                <Image
                  src="/Banner-banner.png"
                  alt="NickelRewards"
                  width={220}
                  height={50}
                  priority
                  unoptimized
                  style={{ borderRadius: '0.5rem', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
                />
              </Link>
              {/* Social Icons */}
              <a href="https://x.com/Bereavednickel7" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white text-2xl transition">
                <FaXTwitter />
              </a>
              <a href="https://kick.com/bereavednickel7" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                <img src="/kick.png" alt="Kick" style={{ width: 21.06, height: 21.06, display: 'block' }} />
              </a>
              <a href="https://discord.gg/g3q5ekz6KC" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white text-2xl transition">
                <FaDiscord />
              </a>
            </div>
            {/* Nav tabs */}
            <nav className="flex items-center gap-3 justify-end w-full">
              <Link
                href="/clash"
                className="py-2 font-bold text-white px-3 border-r border-white/20 hover:border-white/70 transition-colors"
              >
                CLASH.GG
              </Link>
              <Link
                href="/cases"
                className="py-2 font-bold text-white px-3 border-r border-white/20 hover:border-white/70 transition-colors"
              >
                CASES.GG
              </Link>
              <Link
                href="/roobet"
                className="py-2 font-bold text-white px-3 border-r border-white/20 hover:border-white/70 transition-colors"
              >
                ROOBET
              </Link>
              <Link
                href="/roobet2"
                className="py-2 font-bold text-white px-3 transition-colors"
              >
                ROOBET SPORTS
              </Link>
            </nav>
          </div>
        </header>
        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
