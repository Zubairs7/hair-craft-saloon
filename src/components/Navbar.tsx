"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Scissors, Sparkles, UserRound } from "lucide-react";

const bottomLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/book", label: "Book", icon: CalendarCheck },
  { href: "/style-ai", label: "Style", icon: Sparkles },
  { href: "/my-bookings", label: "Mine", icon: UserRound },
];

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-craft-ink/10 bg-craft-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-craft-ink text-craft-copper">
              <Scissors className="h-3.5 w-3.5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-semibold tracking-tight text-craft-ink">
                Hair Craft
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-craft-copper">
                Mens Saloon
              </span>
            </span>
          </Link>
          <Link href="/book" className="btn-primary !px-4 !py-2 !text-xs">
            Book
          </Link>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-craft-ink/10 bg-craft-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {bottomLinks.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition ${
                  active ? "text-craft-copper" : "text-craft-ink/45"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.25]" : ""}`} />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
