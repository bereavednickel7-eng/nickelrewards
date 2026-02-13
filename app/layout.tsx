// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

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
      <body className="min-h-screen">
        {/* Top black nav */}
        <header className="w-full bg-black">
          <div className="mx-auto px-4 py-3 flex items-center justify-between">
            {/* Top-left banner/logo */}
            <Link href="/clash" className="flex items-center gap-3 shrink-0">
              {/* Put your banner in /public/leaderboard-banner.png */}
              <Image
                src="/Banner-banner.png"
                alt="NickelRewards"
                width={400}
                height={80}
                priority
                unoptimized
              />
            </Link>

            {/* Nav tabs */}
            <nav className="flex items-center gap-3">
              <Link
                href="/clash"
                className="px-4 py-2 rounded-md font-bold text-white hover:text-white hover:bg-white/10 transition"
              >
                CLASH.GG
              </Link>
              <Link
                href="/cases"
                className="px-4 py-2 rounded-md font-bold text-white hover:text-white hover:bg-white/10 transition"
              >
                CASES.GG
              </Link>
              <Link
                href="/roobet"
                className="px-4 py-2 rounded-md font-bold text-white hover:text-white hover:bg-white/10 transition"
              >
                ROOBET
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
