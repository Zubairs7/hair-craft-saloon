"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  LogOut,
  Search,
  Users,
  IndianRupee,
  XCircle,
} from "lucide-react";
import { formatTimeRange12 } from "@/lib/salon";
import { BarberPhoto } from "@/components/BarberPhoto";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  recommendedStyle: string | null;
  customer: { name: string; phone: string; email: string | null };
  barber: { id: string; name: string; avatar?: string | null };
  service: { name: string; price: number; durationMin: number };
};

type Barber = { id: string; name: string };

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [barberId, setBarberId] = useState("");
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    confirmedCount: 0,
    dayBookingCount: 0,
    revenueToday: 0,
  });
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (barberId) params.set("barberId", barberId);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setAuthed(true);
      setBookings(data.bookings || []);
      setBarbers(data.barbers || []);
      setStats(data.stats || stats);
      setAdminName(data.admin?.username || "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, barberId, status]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await load();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  async function setBookingStatus(id: string, next: string) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (res.ok) await load();
  }

  const filtered = bookings.filter((b) => {
    if (!q.trim()) return true;
    const hay = `${b.customer.name} ${b.customer.phone} ${b.barber.name} ${b.service.name}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-craft-ink text-craft-mist">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-craft-ink px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-craft-charcoal p-8 shadow-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-craft-copper">
            Hair Craft
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-craft-bone">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-craft-mist">
            View and manage today&apos;s chairs.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label !text-craft-mist/70">Username</label>
              <input
                className="field !bg-white/5 !text-craft-bone !border-white/15"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label !text-craft-mist/70">Password</label>
              <input
                type="password"
                className="field !bg-white/5 !text-craft-bone !border-white/15"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loggingIn}>
              {loggingIn ? "Signing in…" : "Enter dashboard"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <header className="border-b border-craft-ink/10 bg-craft-ink text-craft-bone">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-craft-copper">
              Hair Craft · Admin
            </p>
            <h1 className="font-display text-2xl font-semibold">
              Booking desk
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-craft-mist sm:inline">{adminName}</span>
            <button type="button" className="btn-ghost !text-craft-mist" onClick={logout}>
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Today total",
              value: stats.todayCount,
              icon: CalendarDays,
            },
            {
              label: "Open confirmed",
              value: stats.confirmedCount,
              icon: Users,
            },
            {
              label: "Selected day",
              value: stats.dayBookingCount,
              icon: CheckCircle2,
            },
            {
              label: "Day revenue (₹)",
              value: stats.revenueToday,
              icon: IndianRupee,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-craft-ink/10 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-craft-ink/45">
                  {s.label}
                </p>
                <s.icon className="h-4 w-4 text-craft-copper" />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-craft-ink/10 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label">Date</label>
            <input
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label">Barber</label>
            <select
              className="field"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
            >
              <option value="">All barbers</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Status</label>
            <select
              className="field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
          </div>
          <div className="flex-[1.4]">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-craft-ink/35" />
              <input
                className="field !pl-9"
                placeholder="Name, phone, service…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-craft-ink/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-craft-ink/10 px-4 py-3">
            <h2 className="font-semibold text-craft-ink">
              Schedule · {format(new Date(date + "T12:00:00"), "EEE, MMM d")}
            </h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-craft-ink/40" />}
          </div>

          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-craft-ink/50">
              No bookings for these filters.
            </p>
          ) : (
            <div className="divide-y divide-craft-ink/5">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 gap-3">
                    <BarberPhoto
                      src={b.barber.avatar}
                      name={b.barber.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-craft-copper">
                          {formatTimeRange12(b.startTime, b.endTime)}
                        </span>
                        <StatusPill status={b.status} />
                      </div>
                      <p className="mt-1 font-medium text-craft-ink">
                        {b.customer.name}{" "}
                        <span className="font-normal text-craft-ink/45">
                          · {b.customer.phone}
                        </span>
                      </p>
                      <p className="text-sm text-craft-ink/55">
                        {b.service.name} with {b.barber.name} · ₹{b.service.price}
                        {b.recommendedStyle ? ` · Style: ${b.recommendedStyle}` : ""}
                      </p>
                      {b.notes && (
                        <p className="mt-1 text-xs text-craft-ink/45">Note: {b.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === "confirmed" && (
                      <>
                        <button
                          type="button"
                          className="btn-secondary !px-3 !py-2 !text-xs"
                          onClick={() => setBookingStatus(b.id, "completed")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </button>
                        <button
                          type="button"
                          className="btn-ghost !text-red-700"
                          onClick={() => setBookingStatus(b.id, "cancelled")}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => setBookingStatus(b.id, "no_show")}
                        >
                          No show
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-800",
    completed: "bg-craft-ink/5 text-craft-ink/70",
    cancelled: "bg-red-50 text-red-700",
    no_show: "bg-amber-50 text-amber-800",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        styles[status] || styles.confirmed
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
