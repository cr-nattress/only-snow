import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PageViewTracker from "@/components/PageViewTracker";

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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-blue-400 dark:bg-slate-900 antialiased transition-colors duration-300">
        <Providers>
          <PageViewTracker />
          <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
            <Header />
            <main className="page-transition pb-20 lg:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
