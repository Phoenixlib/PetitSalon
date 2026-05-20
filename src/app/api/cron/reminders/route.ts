import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppReminder, sendWhatsAppTodayReminder } from "@/lib/twilio";
import { env } from "@/env";

// Exportamos dynamic para asegurarnos de que no se cachee
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Validar Autorización
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  if (
    authHeader !== `Bearer ${env.CRON_SECRET}` &&
    secretParam !== env.CRON_SECRET
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    
    // Rango HOY
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Rango MAÑANA
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Buscar citas para HOY que no tengan recordatorio de hoy
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        todayReminderSentAt: null,
        date: { gte: todayStart, lte: todayEnd },
      },
      include: { dog: { include: { owner: true } } },
    });

    // Buscar citas para MAÑANA que no tengan recordatorio de mañana
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        reminderSentAt: null,
        date: { gte: tomorrowStart, lte: tomorrowEnd },
      },
      include: { dog: { include: { owner: true } } },
    });

    const results = {
      todaySent: 0,
      tomorrowSent: 0,
      failed: 0,
      details: [] as any[],
    };

    // --- PROCESAR CITAS DE HOY ---
    for (const app of todayAppointments) {
      const owner = app.dog.owner;
      const timeStr = app.date.toLocaleTimeString("es-ES", {
        hour: "2-digit", minute: "2-digit", hour12: false,
      });

      const response = await sendWhatsAppTodayReminder(owner.phone, {
        ownerName: owner.name,
        petName: app.dog.name,
        dateStr: "hoy",
        timeStr,
      });

      if (response.success) {
        await prisma.appointment.update({
          where: { id: app.id },
          data: { todayReminderSentAt: new Date() },
        });
        results.todaySent++;
      } else {
        results.failed++;
      }
      
      results.details.push({ type: "today", name: app.dog.name, success: response.success });
    }

    // --- PROCESAR CITAS DE MAÑANA ---
    for (const app of tomorrowAppointments) {
      const owner = app.dog.owner;
      const dateStr = app.date.toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long",
      });
      const timeStr = app.date.toLocaleTimeString("es-ES", {
        hour: "2-digit", minute: "2-digit", hour12: false,
      });

      const response = await sendWhatsAppReminder(owner.phone, {
        ownerName: owner.name,
        petName: app.dog.name,
        dateStr,
        timeStr,
      });

      if (response.success) {
        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSentAt: new Date() },
        });
        results.tomorrowSent++;
      } else {
        results.failed++;
      }
      
      results.details.push({ type: "tomorrow", name: app.dog.name, success: response.success });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: any) {
    console.error("[CRON ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
