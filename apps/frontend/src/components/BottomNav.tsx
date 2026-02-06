"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠", activeIcon: "🏠" },
  { href: "/chase", label: "Chase", icon: "🔴", activeIcon: "🔴" },
  { href: "/notifications", label: "Alerts", icon: "🔔", activeIcon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️", activeIcon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800" />

      {/* Nav content */}
      <div className="relative mx-auto max-w-md md:max-w-2xl">
        <div className="flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all btn-press ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
