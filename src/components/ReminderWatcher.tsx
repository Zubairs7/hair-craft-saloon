"use client";

import { useEffect, useRef } from "react";
import { formatTime12 } from "@/lib/salon";

/** Polls for due reminders and shows browser notifications. */
export function ReminderWatcher({ phone }: { phone?: string }) {
  const asked = useRef(false);

  useEffect(() => {
    async function tick() {
      try {
        const res = await fetch("/api/reminders");
        if (!res.ok) return;
        const data = await res.json();
        const list = (data.reminders || []) as Array<{
          id: string;
          startTime: string;
          customer: { name: string; phone: string };
          barber: { name: string };
          service: { name: string };
        }>;

        const relevant = phone
          ? list.filter((r) => r.customer.phone === phone)
          : list;

        if (relevant.length && "Notification" in window) {
          if (Notification.permission === "default" && !asked.current) {
            asked.current = true;
            await Notification.requestPermission();
          }
          if (Notification.permission === "granted") {
            for (const r of relevant) {
              const key = `hc-reminded-${r.id}`;
              if (sessionStorage.getItem(key)) continue;
              new Notification("Hair Craft — appointment soon", {
                body: `${r.service.name} with ${r.barber.name} at ${formatTime12(r.startTime)}. Don't be late!`,
                icon: "/icon.svg",
              });
              sessionStorage.setItem(key, "1");
              await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: r.id }),
              });
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [phone]);

  return null;
}
