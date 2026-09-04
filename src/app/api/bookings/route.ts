import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  addMinutesToTime,
  generateSlots,
  rangesOverlap,
} from "@/lib/salon";

const bookingSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(300).optional(),
  recommendedStyle: z.string().max(80).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const id = searchParams.get("id");

  if (id) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true, barber: true, service: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  }

  if (phone) {
    const bookings = await prisma.booking.findMany({
      where: {
        customer: { phone },
        status: { not: "cancelled" },
      },
      include: { customer: true, barber: true, service: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(bookings);
  }

  return NextResponse.json({ error: "phone or id required" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const [barber, service] = await Promise.all([
      prisma.barber.findUnique({ where: { id: data.barberId } }),
      prisma.service.findUnique({ where: { id: data.serviceId } }),
    ]);

    if (!barber?.active) {
      return NextResponse.json({ error: "Barber unavailable" }, { status: 400 });
    }
    if (!service?.active) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 400 });
    }

    const endTime = addMinutesToTime(data.startTime, service.durationMin);
    const validSlots = generateSlots(data.date, service.durationMin);
    if (!validSlots.includes(data.startTime)) {
      return NextResponse.json(
        { error: "Selected time is outside shop hours" },
        { status: 400 }
      );
    }

    const existing = await prisma.booking.findMany({
      where: {
        date: data.date,
        barberId: data.barberId,
        status: { in: ["confirmed", "completed"] },
      },
    });

    const conflict = existing.some((b) =>
      rangesOverlap(data.startTime, endTime, b.startTime, b.endTime)
    );
    if (conflict) {
      return NextResponse.json(
        { error: "That slot was just taken. Pick another time." },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.upsert({
      where: { phone: data.phone },
      update: {
        name: data.name,
        email: data.email || undefined,
      },
      create: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        barberId: data.barberId,
        serviceId: data.serviceId,
        date: data.date,
        startTime: data.startTime,
        endTime,
        notes: data.notes || null,
        recommendedStyle: data.recommendedStyle || null,
        status: "confirmed",
      },
      include: { customer: true, barber: true, service: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid booking data", details: err.flatten() },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, phone, status } = body as {
      id?: string;
      phone?: string;
      status?: string;
    };

    if (!id || status !== "cancelled") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (phone && booking.customer.phone !== phone) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
      include: { customer: true, barber: true, service: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
