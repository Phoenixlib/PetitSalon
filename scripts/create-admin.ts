import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Instanciamos el cliente nativo sin Neon Serverless Adapter para uso en Node (CLI)
const prisma = new PrismaClient();

async function main() {
  const email = "admin@petitsalon.cl";
  const password = "password123";

  // Verificar si ya existe
  const existingUser = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`✅ El usuario ${email} ya existe.`);
    return;
  }

  // Crear usuario con contraseña encriptada
  const hashedPassword = await hash(password, 10);

  await prisma.adminUser.create({
    data: {
      email,
      password: hashedPassword,
      name: "Administradora",
    },
  });

  console.log(`🎉 Administrador creado exitosamente.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
