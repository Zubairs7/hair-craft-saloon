"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Bell, Loader2 } from "lucide-react";
import { formatTimeRange12 } from "@/lib/salon";
import { BarberPhoto } from "@/components/BarberPhoto";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customer: { name: string; phone: string };
  barber: { name: string; avatar: string | null };
  service: { name: string; price: number; durationMin: number };
  recommendedStyle: string | null;
};

function SuccessInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notifyMsg, setNotifyMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings?id=${id}`)
      .then((r) => r.json())
      .then(setBooking)
      .catch(() => setBooking(null));
  }, [id]);

  async function enableReminders() {
    if (!("Notification" in window)) {
      setNotifyMsg("This browser does not support notifications.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifyMsg("Reminders enabled — keep this site open or revisit before your slot.");
      if (booking) {
        new Notification("Hair Craft booking confirmed", {
          body: `${booking.service.name} with ${booking.barber.name} on ${booking.date} at ${formatTimeRange12(booking.startTime, booking.endTime).split(" – ")[0]}`,
        });
      }
    } else {
      setNotifyMsg("Notifications blocked. You can still find bookings under My Bookings.");
    }
  }

  if (!id) {
    return (
      <p className="text-center text-craft-ink/50">
        Missing booking. <Link href="/book">Book again</Link>
      </p>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center py-20 text-craft-ink/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold">You&apos;re booked</h1>
      <p className="mt-2 text-craft-ink/55">
        See you at Hair Craft Mens Saloon, {booking.customer.name}.
      </p>

      <div className="mt-8 rounded-xl border border-craft-ink/10 bg-white/80 p-5 text-left text-sm shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <BarberPhoto src={booking.barber.avatar} name={booking.barber.name} size="sm" />
          <div>
            <p className="font-medium">{booking.barber.name}</p>
            <p className="text-xs text-craft-ink/50">{booking.service.name}</p>
          </div>
        </div>
        <p className="font-semibold text-craft-copper">
          {format(new Date(booking.date + "T12:00:00"), "EEEE, MMM d")}
        </p>
        <p className="mt-1 font-medium">
          {formatTimeRange12(booking.startTime, booking.endTime)}
        </p>
        <p className="mt-2 text-craft-ink/50">
          {booking.service.durationMin} min · ₹{booking.service.price}
        </p>
        {booking.recommendedStyle && (
          <p className="mt-2 text-craft-sage">Style: {booking.recommendedStyle}</p>
        )}
        <p className="mt-4 text-xs text-craft-ink/40">Ref: {booking.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <button type="button" className="btn-primary mt-6" onClick={enableReminders}>
        <Bell className="h-4 w-4" /> Enable appointment reminders
      </button>
      {notifyMsg && <p className="mt-3 text-sm text-craft-ink/55">{notifyMsg}</p>}

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/my-bookings" className="btn-secondary">
          My bookings
        </Link>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="px-4 py-12 pb-28 sm:px-6">
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <SuccessInner />
      </Suspense>
    </div>
  );
}
