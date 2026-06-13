import { PrismaClient } from "@prisma/client";
import { getCalComEventTypes, createCalComEventType, updateCalComEventType } from "../src/lib/calcom";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { env } from "../src/env";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migración de eventos de sobrecupo en Cal.com...");

  const services = await prisma.service.findMany();
  const calcomEvents = await getCalComEventTypes();
  const overbookingScheduleId = env.CALCOM_OVERBOOKING_SCHEDULE_ID ? Number(env.CALCOM_OVERBOOKING_SCHEDULE_ID) : undefined;

  if (!overbookingScheduleId) {
    console.error("No se encontró CALCOM_OVERBOOKING_SCHEDULE_ID en el entorno.");
    process.exit(1);
  }

  const siteConfig = await prisma.siteConfig.findUnique({ where: { key: "address" } });
  const address = siteConfig?.value || "Carvajal 0330, La Cisterna";

  for (const service of services) {
    console.log(`\nProcesando servicio: ${service.name} (ID: ${service.id})`);
    
    // Skip if already has an overbooking event type
    if (service.calComOverbookingEventTypeId) {
      console.log(`  Ya tiene calComOverbookingEventTypeId: ${service.calComOverbookingEventTypeId}. Omitiendo.`);
      continue;
    }

    let overbookingEventId = null;

    if (service.calComSlug && calcomEvents) {
      const overbookingSlug = `${service.calComSlug}-sobrecupo`;
      const match = calcomEvents.find((e: any) => e.slug === overbookingSlug);

      if (match) {
        console.log(`  Encontrado evento existente en Cal.com con slug ${overbookingSlug} (ID: ${match.id})`);
        overbookingEventId = match.id;
        
        try {
          await updateCalComEventType(
            overbookingEventId,
            service.name,
            service.duration,
            service.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            overbookingSlug
          );
          console.log(`  Evento de sobrecupo actualizado en Cal.com`);
        } catch (e) {
          console.error(`  Error actualizando evento existente en Cal.com:`, e);
        }
      } else {
        console.log(`  No se encontró evento con slug ${overbookingSlug}. Creando nuevo...`);
        try {
          const newEvent = await createCalComEventType(
            service.name,
            service.duration,
            service.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            overbookingSlug
          );
          if (newEvent) {
            overbookingEventId = newEvent.id;
            console.log(`  Nuevo evento de sobrecupo creado en Cal.com (ID: ${overbookingEventId})`);
          }
        } catch (e) {
          console.error(`  Error creando evento de sobrecupo en Cal.com:`, e);
        }
      }
    } else {
      console.log(`  El servicio no tiene calComSlug. No se puede crear sobrecupo asociado correctamente.`);
    }

    if (overbookingEventId) {
      await prisma.service.update({
        where: { id: service.id },
        data: { calComOverbookingEventTypeId: overbookingEventId },
      });
      console.log(`  Servicio actualizado en DB con calComOverbookingEventTypeId: ${overbookingEventId}`);
    }
  }

  console.log("\nMigración completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
