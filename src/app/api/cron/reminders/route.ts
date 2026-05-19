import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppReminder } from "@/lib/twilio";
import { env } from "@/env";

// Exportamos dynamic para asegurarnos de que no se cachee
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Validar Autorización
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  // Permitimos Authorization Bearer o secret por query param (para pruebas manuales)
  if (
    authHeader !== `Bearer ${env.CRON_SECRET}` &&
    secretParam !== env.CRON_SECRET
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Definir el rango de tiempo (mañana)
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // 3. Buscar citas CONFIRMADAS para mañana que no tengan recordatorio enviado
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        reminderSentAt: null,
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

    const results = {
      total: appointments.length,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    // 4. Procesar envíos
    for (const app of appointments) {
      const owner = app.dog.owner;

      // Formatear fecha y hora
      const dateStr = app.date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const timeStr = app.date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const response = await sendWhatsAppReminder(owner.phone, {
        ownerName: owner.name,
        petName: app.dog.name,
        dateStr,
        timeStr,
      });

      if (response.success) {
        // Actualizar en la base de datos
        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSentAt: new Date() },
        });
        results.sent++;
      } else {
        results.failed++;
      }

      results.details.push({
        appointmentId: app.id,
        owner: owner.name,
        success: response.success,
        error: response.error,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: any) {
    console.error("[CRON ERROR] Fallo en el proceso de recordatorios:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
