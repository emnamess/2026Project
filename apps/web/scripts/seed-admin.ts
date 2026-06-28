import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const EMAIL = "admin@artisan.tn";
const PASSWORD = "Admin1234!";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`Admin already exists: ${EMAIL}`);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: EMAIL,
      passwordHash,
      firstName: "Admin",
      role: "admin",
    },
  });

  console.log(`✓ Admin created: ${EMAIL} / ${PASSWORD}`);
  console.log("  Change this password immediately after first login.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
