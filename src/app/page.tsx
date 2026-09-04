import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  CalendarCheck,
  Bell,
} from "lucide-react";
import { SALON, SERVICE_DEFAULTS, BARBER_DEFAULTS } from "@/lib/salon";
import { BarberPhoto } from "@/components/BarberPhoto";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[78vh] overflow-hidden bg-craft-ink text-craft-bone">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(184,115,51,0.35), transparent 55%), linear-gradient(160deg, #0c0b0a 0%, #1a1816 50%, #241810 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto flex min-h-[78vh] max-w-lg flex-col justify-end px-4 pb-16 pt-12">
          <p className="animate-fade-up text-[10px] font-semibold uppercase tracking-[0.28em] text-craft-copper">
            Haliyal · Mens grooming
          </p>
          <h1 className="animate-fade-up mt-3 font-display text-[3.25rem] font-semibold leading-[0.92] tracking-tight">
            Hair Craft
            <span className="mt-1 block text-2xl font-medium tracking-[0.06em] text-craft-mist">
              Mens Saloon
            </span>
          </h1>
          <p className="animate-fade-up mt-4 max-w-xs text-[15px] leading-relaxed text-craft-mist">
            Book Babu or Shivappa in a few taps — no waiting guesswork.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col gap-3">
            <Link href="/book" className="btn-primary w-full !py-3.5">
              Book appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/style-ai"
              className="btn-secondary w-full !border-white/20 !bg-white/5 !py-3.5 !text-craft-bone"
            >
              <Sparkles className="h-4 w-4" /> Find my style
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-craft-ink/10 bg-white/50 px-4 py-5">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-craft-copper" />
            <div>
              <p className="text-sm font-semibold text-craft-ink">Shop hours</p>
              <p className="text-sm text-craft-ink/55">
                Sun–Fri 9:00 AM – 9:00 PM
              </p>
              <p className="text-sm text-craft-ink/55">
                Saturday 9:00 AM – 12:00 PM
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-craft-copper" />
            <p className="text-sm text-craft-ink/60">{SALON.address}</p>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-lg px-4 py-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-craft-copper">
          Services
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold">
          Cuts &amp; timing
        </h2>
        <div className="mt-6 space-y-3">
          {SERVICE_DEFAULTS.map((s) => (
            <Link
              key={s.slug}
              href="/book"
              className="flex items-center justify-between gap-3 rounded-xl border border-craft-ink/10 bg-white/80 px-4 py-4 active:scale-[0.99]"
            >
              <div>
                <p className="font-semibold text-craft-ink">{s.name}</p>
                <p className="text-xs text-craft-ink/50">{s.durationMin} min</p>
              </div>
              <p className="font-display text-2xl font-semibold text-craft-copper">
                ₹{s.price}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="barbers" className="bg-craft-ink px-4 py-12 text-craft-bone">
        <div className="mx-auto max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-craft-copper">
            Your barbers
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold">
            Pick your chair
          </h2>
          <div className="mt-6 space-y-4">
            {BARBER_DEFAULTS.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <BarberPhoto src={b.avatar} name={b.name} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-semibold">{b.name}</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-craft-copper">
                    {b.specialty}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-craft-mist">
                    {b.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/book" className="btn-primary mt-6 w-full !py-3.5">
            Choose barber <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-4 py-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-craft-copper">
          Why book here
        </p>
        <div className="mt-5 space-y-5">
          {[
            {
              icon: CalendarCheck,
              title: "Live slots",
              text: "See open times per barber — no double bookings.",
            },
            {
              icon: Bell,
              title: "Reminders",
              text: "Get an alert about an hour before your cut.",
            },
            {
              icon: Sparkles,
              title: "Style AI",
              text: "Selfie in — get a cut that suits your face.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-craft-copper" />
              <div>
                <h3 className="font-semibold text-craft-ink">{f.title}</h3>
                <p className="text-sm text-craft-ink/55">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-craft-ink/10 px-4 pb-28 pt-10">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl font-semibold">Ready?</h2>
          <p className="mt-2 text-sm text-craft-ink/55">
            Reserve your chair at Hair Craft Mens Saloon, Haliyal.
          </p>
          <Link href="/book" className="btn-primary mt-6 w-full !py-3.5">
            Book now
          </Link>
        </div>
      </section>
    </>
  );
}
