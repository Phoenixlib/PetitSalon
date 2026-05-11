import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@petitsalon.cl" },
    update: {},
    create: {
      email: "admin@petitsalon.cl",
      password: hash,
      name: "Administradora",
    },
  });
  console.log("✅ AdminUser creado");

  // Servicios reales de Petitsalon
  // calComLink: usa los 3 eventos creados en Cal.com agrupados por duración
  // servicio90min  → hasta 90 min
  // servicio120min → 120 min
  // servicio150min → 150 min
  const services = [
    {
      name: "Baño y Secado",
      price: 12000,
      duration: 60,
      description:
        "Baño completo con shampoo profesional, acondicionador, secado y cepillado.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Corte de Pelo",
      price: 15000,
      duration: 75,
      description: "Corte a medida según la raza, perfil o gustos del dueño.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Baño + Corte",
      price: 22000,
      duration: 120,
      description:
        "Servicio completo: baño, secado y corte de pelo. El más solicitado.",
      calComLink: "petitsalon/servicio120min",
    },
    {
      name: "Corte de Uñas",
      price: 4000,
      duration: 15,
      description: "Corte y limado de uñas para la comodidad de tu mascota.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Limpieza de Oídos",
      price: 4000,
      duration: 15,
      description: "Limpieza suave del conducto auditivo externo.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Deslanado",
      price: 18000,
      duration: 90,
      description:
        "Retiro del pelo muerto en razas de doble capa. Reduce la caída y mejora el pelo.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Spa Completo",
      price: 32000,
      duration: 150,
      description:
        "Baño, corte, deslanado, corte de uñas y limpieza de oídos. Experiencia premium.",
      calComLink: "petitsalon/servicio150min",
    },
  ];

  const count = await prisma.service.count();
  if (count === 0) {
    await prisma.service.createMany({ data: services });
    console.log(`✅ ${services.length} servicios creados`);
  } else {
    // Actualizar calComLink en servicios existentes aunque ya estén creados
    for (const s of services) {
      await prisma.service.updateMany({
        where: { name: s.name },
        data: { calComLink: s.calComLink },
      });
    }
    console.log(
      `ℹ️  Servicios ya existentes (${count}), calComLink actualizado`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
