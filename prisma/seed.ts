import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const receptionistPassword = await bcrypt.hash("reception123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      fullName: "System Administrator",
      role: "ADMIN",
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { username: "receptionist" },
    update: {},
    create: {
      username: "receptionist",
      password: receptionistPassword,
      fullName: "Akosua Mensah",
      role: "RECEPTIONIST",
    },
  });

  console.log("Created users:", { admin: admin.username, receptionist: receptionist.username });

  const patient1 = await prisma.patient.create({
    data: {
      fullName: "Ama Asante",
      gender: "Female",
      phoneNumber: "0241234567",
      address: "Accra, Osu",
      dateOfBirth: new Date("1990-03-15"),
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      fullName: "Kwame Boateng",
      gender: "Male",
      phoneNumber: "0271234568",
      address: "Kumasi, Adum",
      dateOfBirth: new Date("1985-07-22"),
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      fullName: "Efua Owusu",
      gender: "Female",
      phoneNumber: "0201234569",
      address: "Cape Coast",
      dateOfBirth: new Date("1995-11-08"),
    },
  });

  console.log("Created patients:", [patient1.fullName, patient2.fullName, patient3.fullName]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 30, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorName: "Dr. Mensah",
        appointmentDate: tomorrow,
        status: "SCHEDULED",
      },
      {
        patientId: patient2.id,
        doctorName: "Dr. Appiah",
        appointmentDate: nextWeek,
        status: "SCHEDULED",
      },
      {
        patientId: patient3.id,
        doctorName: "Dr. Mensah",
        appointmentDate: tomorrow,
        status: "SCHEDULED",
      },
    ],
  });

  console.log("Created sample appointments");
  console.log("\nSeed complete!");
  console.log("Login credentials:");
  console.log("  Admin: admin / admin123");
  console.log("  Receptionist: receptionist / reception123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
