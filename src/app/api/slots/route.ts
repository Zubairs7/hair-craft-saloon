import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addMinutesToTime,
  generateSlots,
  rangesOverlap,
} from "@/lib/salon";

export type SlotStatus = "available" | "booked" | "past";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");

  if (!date || !barberId || !serviceId) {
    return NextResponse.json(
      { error: "date, barberId, and serviceId are required" },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      date,
      barberId,
      status: { in: ["confirmed", "completed"] },
    },
  });

  const allSlots = generateSlots(date, service.durationMin);
  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const slots = allSlots.map((start) => {
    const end = addMinutesToTime(start, service.durationMin);
    const booked = bookings.some((b) =>
      rangesOverlap(start, end, b.startTime, b.endTime)
    );

    let status: SlotStatus = "available";
    if (booked) {
      status = "booked";
    } else if (date === todayStr) {
      const [h, m] = start.split(":").map(Number);
      const slotDate = new Date(now);
      slotDate.setHours(h, m, 0, 0);
      if (slotDate.getTime() <= now.getTime() + 15 * 60 * 1000) {
        status = "past";
      }
    }

    return { time: start, end, status };
  });

  return NextResponse.json({
    date,
    durationMin: service.durationMin,
    slots,
    availableCount: slots.filter((s) => s.status === "available").length,
  });
}
