import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutesToTime, formatTime12, timeToMinutes } from "@/lib/salon";
import { format } from "date-fns";

/** Finds bookings due for a reminder (~1 hour before start). */
export async function GET() {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const bookings = await prisma.booking.findMany({
    where: {
      date: today,
      status: "confirmed",
      reminderSent: false,
    },
    include: { customer: true, barber: true, service: true },
  });

  const due = bookings.filter((b) => {
    const start = timeToMinutes(b.startTime);
    const minsUntil = start - currentMins;
    return minsUntil >= 0 && minsUntil <= 60;
  });

  return NextResponse.json({ reminders: due, checkedAt: now.toISOString() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { bookingId } = body as { bookingId?: string };

  if (bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { reminderSent: true },
    });
    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const bookings = await prisma.booking.findMany({
    where: { date: today, status: "confirmed", reminderSent: false },
    include: { customer: true, barber: true, service: true },
  });

  const due = bookings.filter((b) => {
    const start = timeToMinutes(b.startTime);
    const minsUntil = start - currentMins;
    return minsUntil >= 0 && minsUntil <= 60;
  });

  await Promise.all(
    due.map((b) =>
      prisma.booking.update({
        where: { id: b.id },
        data: { reminderSent: true },
      })
    )
  );

  return NextResponse.json({
    sent: due.map((b) => ({
      id: b.id,
      customer: b.customer.name,
      phone: b.customer.phone,
      message: `Hi ${b.customer.name}, reminder: your ${b.service.name} with ${b.barber.name} at Hair Craft Mens Saloon is today at ${formatTime12(b.startTime)} (ends ~${formatTime12(addMinutesToTime(b.startTime, b.service.durationMin))}). See you soon!`,
    })),
  });
}
