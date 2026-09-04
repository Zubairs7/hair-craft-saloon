import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");
  const barberId = searchParams.get("barberId") || undefined;
  const status = searchParams.get("status") || undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      date,
      ...(barberId ? { barberId } : {}),
      ...(status ? { status } : {}),
    },
    include: { customer: true, barber: true, service: true },
    orderBy: { startTime: "asc" },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const [todayCount, confirmedCount, barbers, services] = await Promise.all([
    prisma.booking.count({
      where: { date: today, status: { in: ["confirmed", "completed"] } },
    }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.barber.findMany({ where: { active: true } }),
    prisma.service.findMany({ where: { active: true } }),
  ]);

  const revenueToday = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.service.price, 0);

  return NextResponse.json({
    bookings,
    stats: {
      todayCount,
      confirmedCount,
      dayBookingCount: bookings.filter((b) => b.status !== "cancelled").length,
      revenueToday,
    },
    barbers,
    services,
    admin: { username: admin.username },
  });
}

export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body as { id?: string; status?: string };
  const allowed = ["confirmed", "completed", "cancelled", "no_show"];
  if (!id || !status || !allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { customer: true, barber: true, service: true },
  });

  return NextResponse.json(updated);
}
