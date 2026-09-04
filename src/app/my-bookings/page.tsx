"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Search, XCircle } from "lucide-react";
import { formatTimeRange12 } from "@/lib/salon";
import { BarberPhoto } from "@/components/BarberPhoto";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  recommendedStyle: string | null;
  barber: { name: string; avatar: string | null };
  service: { name: string; price: number; durationMin: number };
};

export default function MyBookingsPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("hc_phone");
    if (saved) setPhone(saved);
  }, []);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (phone.trim().length < 8) {
      setError("Enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`/api/bookings?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setBookings(data);
      localStorage.setItem("hc_phone", phone.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, phone: phone.trim(), status: "cancelled" }),
    });
    if (res.ok) search();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-28">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-craft-copper">
        Customer desk
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">My bookings</h1>
      <p className="mt-2 text-sm text-craft-ink/55">
        Look up with the phone number you used when booking.
      </p>

      <form onSubmit={search} className="mt-8 flex gap-2">
        <input
          className="field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
        />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Find
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-8 space-y-3">
        {searched && !loading && bookings.length === 0 && (
          <p className="rounded-xl border border-dashed border-craft-ink/15 bg-white/50 px-4 py-10 text-center text-sm text-craft-ink/55">
            No upcoming bookings for this number.{" "}
            <Link href="/book" className="text-craft-copper underline">
              Book one
            </Link>
          </p>
        )}
        {bookings.map((b) => (
          <article
            key={b.id}
            className="rounded-xl border border-craft-ink/10 bg-white/80 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <BarberPhoto src={b.barber.avatar} name={b.barber.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-craft-copper">
                  {format(new Date(b.date + "T12:00:00"), "EEE, MMM d")}
                </p>
                <p className="text-sm font-medium">
                  {formatTimeRange12(b.startTime, b.endTime)}
                </p>
                <p className="mt-1 text-sm">
                  {b.service.name} with {b.barber.name}
                </p>
                <p className="text-xs text-craft-ink/50">
                  {b.service.durationMin} min · ₹{b.service.price}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-craft-ink/40">
                  {b.status}
                </p>
              </div>
              {b.status === "confirmed" && (
                <button
                  type="button"
                  className="btn-ghost !px-2 !text-red-700"
                  onClick={() => cancel(b.id)}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
