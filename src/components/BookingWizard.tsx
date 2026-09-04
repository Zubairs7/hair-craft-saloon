"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Scissors,
  Sparkles,
} from "lucide-react";
import {
  addMinutesToTime,
  formatTime12,
  formatTimeRange12,
  getOpenClose,
  isSaturday,
} from "@/lib/salon";
import { BarberPhoto } from "@/components/BarberPhoto";

type Barber = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  avatar: string | null;
};
type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationMin: number;
  price: number;
};

type Slot = {
  time: string;
  end: string;
  status: "available" | "booked" | "past";
};

const STEPS = ["Service", "Barber", "When", "Details", "Confirm"] as const;

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const styleParam = searchParams.get("style") || "";

  const [step, setStep] = useState(0);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotHint, setSlotHint] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState(
    styleParam ? `Preferred style: ${styleParam}` : ""
  );
  const [recommendedStyle, setRecommendedStyle] = useState(styleParam);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        setBarbers(d.barbers || []);
        setServices(d.services || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!serviceId || !barberId || !date) return;
    setSlotsLoading(true);
    setStartTime("");
    setSlotHint("");
    fetch(
      `/api/slots?date=${date}&barberId=${barberId}&serviceId=${serviceId}`
    )
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [serviceId, barberId, date]);

  const availableCount = useMemo(
    () => slots.filter((s) => s.status === "available").length,
    [slots]
  );

  function onSlotPress(slot: Slot) {
    if (slot.status === "booked") {
      setSlotHint(`${formatTime12(slot.time)} is already booked. Pick another time.`);
      return;
    }
    if (slot.status === "past") {
      setSlotHint(`${formatTime12(slot.time)} has already passed.`);
      return;
    }
    setSlotHint("");
    setStartTime(slot.time);
  }

  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);
  const hours = useMemo(() => getOpenClose(date), [date]);

  const dates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = addDays(new Date(), i);
        return format(d, "yyyy-MM-dd");
      }),
    []
  );

  function canNext() {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!barberId;
    if (step === 2) return !!date && !!startTime;
    if (step === 3) return name.trim().length >= 2 && phone.trim().length >= 8;
    return true;
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          barberId,
          serviceId,
          date,
          startTime,
          notes: notes.trim(),
          recommendedStyle: recommendedStyle || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      localStorage.setItem("hc_phone", phone.trim());
      router.push(`/booking/success?id=${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-craft-ink/50">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden pb-4">
      <div className="border-b border-craft-ink/10 bg-craft-ink px-4 py-4 text-craft-bone">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-craft-copper">
              Book your chair
            </p>
            <h1 className="font-display text-2xl font-semibold">{STEPS[step]}</h1>
          </div>
          <p className="text-xs text-craft-mist">
            {step + 1}/{STEPS.length}
          </p>
        </div>
        <div className="mt-3 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={STEPS[i]}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-craft-copper" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {step === 0 && (
          <div className="space-y-3">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition active:scale-[0.99] ${
                  serviceId === s.id
                    ? "border-craft-copper bg-craft-copper/10"
                    : "border-craft-ink/10 bg-white/80"
                }`}
              >
                <Scissors className="h-5 w-5 shrink-0 text-craft-copper" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-craft-ink">{s.name}</span>
                  <span className="block text-xs text-craft-ink/50">
                    {s.durationMin} min
                  </span>
                </span>
                <span className="font-display text-2xl font-semibold text-craft-copper">
                  ₹{s.price}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {barbers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBarberId(b.id)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition active:scale-[0.99] ${
                  barberId === b.id
                    ? "border-craft-copper bg-craft-copper/10"
                    : "border-craft-ink/10 bg-white/80"
                }`}
              >
                <BarberPhoto src={b.avatar} name={b.name} size="md" />
                <span>
                  <span className="block font-display text-xl font-semibold">
                    {b.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-craft-copper">
                    {b.specialty}
                  </span>
                  <span className="mt-1 block text-xs text-craft-ink/55 line-clamp-2">
                    {b.bio}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="label">Pick a day</label>
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dates.map((d) => {
                  const sat = isSaturday(d);
                  const label = format(new Date(d + "T12:00:00"), "EEE d");
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`min-w-[68px] rounded-xl border px-2 py-3 text-center ${
                        date === d
                          ? "border-craft-copper bg-craft-copper text-white"
                          : "border-craft-ink/10 bg-white/80"
                      }`}
                    >
                      <span className="block text-[10px] opacity-70">
                        {label.split(" ")[0]}
                      </span>
                      <span className="block text-lg font-semibold">
                        {label.split(" ")[1]}
                      </span>
                      {sat && (
                        <span className="mt-0.5 block text-[8px] uppercase">
                          half
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-craft-ink/50">
                Open {formatTimeRange12(hours.open, hours.close)}
                {isSaturday(date) ? " · Saturday" : ""}
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="label !mb-0">Select time</label>
                {!slotsLoading && slots.length > 0 && (
                  <span className="text-[10px] font-medium text-craft-ink/45">
                    {availableCount} open
                  </span>
                )}
              </div>
              {slotsLoading ? (
                <p className="flex items-center gap-2 text-sm text-craft-ink/50">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </p>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-dashed border-craft-ink/15 bg-white/50 px-4 py-6 text-center text-sm text-craft-ink/60">
                  Shop closed this day for this service length.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const selected = startTime === slot.time;
                      const locked = slot.status !== "available";
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => onSlotPress(slot)}
                          aria-disabled={locked}
                          className={`relative rounded-xl border px-1 py-2.5 text-center transition active:scale-[0.98] ${
                            selected
                              ? "border-craft-copper bg-craft-copper text-white"
                              : slot.status === "booked"
                                ? "cursor-not-allowed border-craft-ink/10 bg-craft-ink/[0.04] text-craft-ink/35"
                                : slot.status === "past"
                                  ? "cursor-not-allowed border-transparent bg-transparent text-craft-ink/25 line-through"
                                  : "border-craft-ink/10 bg-white text-craft-ink"
                          }`}
                        >
                          <span className="block text-sm font-semibold">
                            {formatTime12(slot.time)}
                          </span>
                          {slot.status === "booked" && (
                            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-red-500/80">
                              Booked
                            </span>
                          )}
                          {slot.status === "past" && (
                            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-wide">
                              Passed
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-craft-ink/45">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm border border-craft-ink/15 bg-white" />
                      Available
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-craft-ink/10" />
                      Already booked
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-craft-ink/5" />
                      Passed
                    </span>
                  </div>
                  {slotHint && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      {slotHint}
                    </p>
                  )}
                  {availableCount === 0 && (
                    <p className="mt-3 text-center text-sm text-craft-ink/55">
                      All slots taken for this day. Try another date or barber.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="field !py-3.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Phone (for reminders)
              </label>
              <input
                id="phone"
                className="field !py-3.5"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                className="field !py-3.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes / style
              </label>
              <textarea
                id="notes"
                className="field min-h-[88px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. mid fade, keep length on top"
              />
            </div>
            {recommendedStyle && (
              <p className="flex items-center gap-2 rounded-lg bg-craft-sage/10 px-3 py-2 text-sm text-craft-sage">
                <Sparkles className="h-4 w-4 shrink-0" />
                AI pick: {recommendedStyle}
              </p>
            )}
          </div>
        )}

        {step === 4 && service && barber && (
          <div className="space-y-4">
            <div className="rounded-xl border border-craft-ink/10 bg-white/80 p-4">
              <div className="mb-4 flex items-center gap-3">
                <BarberPhoto src={barber.avatar} name={barber.name} size="sm" />
                <div>
                  <p className="font-semibold">{barber.name}</p>
                  <p className="text-xs text-craft-ink/50">{service.name}</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between gap-3">
                  <span className="text-craft-ink/50">When</span>
                  <span className="text-right font-medium">
                    {format(new Date(date + "T12:00:00"), "EEE, MMM d")}
                    <br />
                    {formatTimeRange12(
                      startTime,
                      addMinutesToTime(startTime, service.durationMin)
                    )}
                  </span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-craft-ink/50">Price</span>
                  <span className="font-medium">
                    ₹{service.price} · {service.durationMin} min
                  </span>
                </li>
                <li className="flex justify-between gap-3">
                  <span className="text-craft-ink/50">You</span>
                  <span className="text-right font-medium">
                    {name}
                    <br />
                    <span className="font-normal text-craft-ink/45">{phone}</span>
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-craft-ink/50">
              Enable reminders on the next screen so you get an alert before your slot.
            </p>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-craft-ink/10 pt-4">
          <button
            type="button"
            className="btn-ghost !min-h-11"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn-primary !min-h-11"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary !min-h-11"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Booking…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirm
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
