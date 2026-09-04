import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BARBER_DEFAULTS, SERVICE_DEFAULTS } from "../src/lib/salon";

const prisma = new PrismaClient();

async function main() {
  for (const service of SERVICE_DEFAULTS) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        price: service.price,
        active: true,
      },
      create: { ...service },
    });
  }

  for (const barber of BARBER_DEFAULTS) {
    const existing = await prisma.barber.findFirst({
      where: { name: barber.name },
    });
    if (existing) {
      await prisma.barber.update({
        where: { id: existing.id },
        data: {
          specialty: barber.specialty,
          bio: barber.bio,
          avatar: barber.avatar,
          active: true,
        },
      });
    } else {
      await prisma.barber.create({ data: { ...barber } });
    }
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log("Seeded barbers, services, and admin.");
  console.log(`Admin login → username: ${username} / password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
