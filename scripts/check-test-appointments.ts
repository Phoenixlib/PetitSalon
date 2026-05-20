import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAppointments() {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  console.log(
    `Buscando citas entre: ${tomorrowStart.toISOString()} y ${tomorrowEnd.toISOString()}`,
  );

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      date: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    include: {
      dog: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (appointments.length === 0) {
    console.log("No hay citas confirmadas para mañana.");

    // Buscar cualquier cita confirmada para ver si hay datos
    const allConfirmed = await prisma.appointment.findMany({
      where: { status: "CONFIRMED" },
      take: 5,
    });
    console.log(`Total citas confirmadas encontradas: ${allConfirmed.length}`);
  } else {
    console.log(`Se encontraron ${appointments.length} citas para mañana:`);
    appointments.forEach((app) => {
      console.log(
        `- Perro: ${app.dog.name}, Dueño: ${app.dog.owner.name}, Fecha: ${app.date.toISOString()}`,
      );
    });
  }
}

checkAppointments()
  .catch(console.error)
  .finally(() => process.exit());
