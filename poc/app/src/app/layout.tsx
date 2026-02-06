import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "OnlySnow",
  description:
    "Tell us where you live and what pass you have. We'll tell you where to ski and when.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-blue-400 dark:bg-slate-900 antialiased transition-colors duration-300">
        <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
          {/* Site header */}
          <header className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-1.5 btn-press">
              <span className="text-lg lg:text-xl">🏔️</span>
              <span className="text-lg lg:text-xl font-extrabold tracking-tight text-white">
                Only<span className="text-blue-100 dark:text-blue-300">Snow</span>
              </span>
            </Link>
            <Link
              href="/settings"
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center hover:bg-white/30 dark:hover:bg-white/20 transition-colors btn-press"
            >
              <span className="text-sm lg:text-base text-white font-bold">CN</span>
            </Link>
          </header>

          <Providers>
            <div className="page-transition">
              {children}
            </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
