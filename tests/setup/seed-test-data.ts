import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test database...");

  // 1. Admin user
  const adminEmail = "admin@petitsalon.cl";
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { password: hash },
    create: {
      email: adminEmail,
      password: hash,
      name: "Administradora de Test",
    },
  });
  console.log("✅ Test AdminUser ensured");

  // 2. Ensure test Service exists
  const serviceName = "Corte de Pelo Test";
  let service = await prisma.service.findFirst({
    where: { name: serviceName },
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: serviceName,
        price: 15000,
        duration: 75,
        description: "Servicio de corte de pelo para pruebas automatizadas",
        calComLink: "petitsalon/servicio90min",
      },
    });
  }
  console.log("✅ Test Service ensured");

  // 3. Ensure test Owner exists
  const ownerEmail = "owner-test@petitsalon.cl";
  const ownerPhone = "+56999999999";
  let owner = await prisma.owner.findUnique({
    where: { phone: ownerPhone },
  });
  if (owner) {
    // Delete old test appointments/dogs to prevent duplicate key or state pollution
    await prisma.review.deleteMany({
      where: {
        token: "test-review-token-12345",
      },
    });
    await prisma.appointment.deleteMany({
      where: {
        dog: { ownerId: owner.id },
      },
    });
    await prisma.dog.deleteMany({
      where: { ownerId: owner.id },
    });
  } else {
    owner = await prisma.owner.create({
      data: {
        name: "Dueño Test",
        phone: ownerPhone,
        email: ownerEmail,
      },
    });
  }
  console.log("✅ Test Owner ensured");

  // 4. Create test Dog
  const dog = await prisma.dog.create({
    data: {
      name: "Fido Test",
      breed: "Poodle",
      age: "3 años",
      weight: "8 kg",
      ownerId: owner.id,
    },
  });
  console.log("✅ Test Dog created");

  // 5. Create test Appointment (PENDING)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointment = await prisma.appointment.create({
    data: {
      date: tomorrow,
      status: "PENDING",
      serviceId: service.id,
      dogId: dog.id,
      notes: "Nota de test",
    },
  });
  console.log("✅ Test Appointment created");

  // 6. Create test Review with known token
  await prisma.review.create({
    data: {
      token: "test-review-token-12345",
      ownerName: "Dueño Test",
      petName: "Fido Test",
      rating: 0,
      text: "",
      status: "PENDING",
      appointmentId: appointment.id,
    },
  });
  console.log("✅ Test Review created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
