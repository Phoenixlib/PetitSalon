import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Instanciamos el cliente nativo sin Neon Serverless Adapter para uso en Node (CLI)
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@petitsalon.cl";
  const name = process.argv[3] || "Administradora";
  const password = process.argv[4] || "password123";

  // Crear o actualizar usuario con contraseña encriptada
  const hashedPassword = await hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: name,
    },
    create: {
      email,
      password: hashedPassword,
      name: name,
    },
  });

  console.log(
    `🎉 Administrador ${email} configurado/actualizado exitosamente.`,
  );
  console.log(`Nombre: ${name}`);
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
