import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [barbers, services] = await Promise.all([
    prisma.barber.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return NextResponse.json({ barbers, services });
}
