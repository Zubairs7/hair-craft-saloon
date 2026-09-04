"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Clock } from "lucide-react";
import { SALON } from "@/lib/salon";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-craft-ink/10 bg-craft-ink pb-24 text-craft-bone md:pb-0">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
        <div>
          <p className="font-display text-2xl font-semibold">Hair Craft</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-craft-copper">
            Mens Saloon · Haliyal
          </p>
        </div>

        <div className="space-y-3 text-sm text-craft-mist">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-craft-copper" />
            {SALON.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-craft-copper" />
            {SALON.phone}
          </p>
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-craft-copper" />
            <span>
              Sun–Fri: 9:00 AM – 9:00 PM
              <br />
              Saturday: 9:00 AM – 12:00 PM
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/book" className="text-craft-bone hover:text-craft-copper">
            Book
          </Link>
          <Link href="/style-ai" className="text-craft-bone hover:text-craft-copper">
            Style AI
          </Link>
          <Link href="/my-bookings" className="text-craft-bone hover:text-craft-copper">
            My bookings
          </Link>
          <Link href="/admin" className="text-craft-mist/60 hover:text-craft-copper">
            Admin
          </Link>
        </div>

        <p className="border-t border-white/10 pt-4 text-center text-[11px] text-craft-mist/60">
          © {new Date().getFullYear()} Hair Craft Mens Saloon
        </p>
      </div>
    </footer>
  );
}
