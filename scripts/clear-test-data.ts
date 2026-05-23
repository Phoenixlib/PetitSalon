import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpieza de datos de prueba...");

  try {
    // El orden importa por las claves foráneas (FK)
    console.log("- Eliminando asistencias (Attendance)...");
    const attendances = await prisma.attendance.deleteMany({});
    console.log(`  ✅ ${attendances.count} asistencias eliminadas.`);

    console.log("- Eliminando reseñas...");
    const reviews = await prisma.review.deleteMany({});
    console.log(`  ✅ ${reviews.count} reseñas eliminadas.`);

    console.log("- Eliminando citas...");
    const appointments = await prisma.appointment.deleteMany({});
    console.log(`  ✅ ${appointments.count} citas eliminadas.`);

    console.log("- Eliminando perros...");
    const dogs = await prisma.dog.deleteMany({});
    console.log(`  ✅ ${dogs.count} perros eliminados.`);

    console.log("- Eliminando clientes (dueños)...");
    const owners = await prisma.owner.deleteMany({});
    console.log(`  ✅ ${owners.count} clientes eliminados.`);

    console.log("\n✨ Limpieza completada con éxito.");
    console.log(
      "Nota: Se han mantenido los servicios, categorías, configuración del sitio, galería y usuarios admin.",
    );
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
