import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_WORKING_HOURS } from "@/components/booking/config";

/**
 * GET /api/appointments/available?date=YYYY-MM-DD
 *
 * Devuelve los slots horarios disponibles para el día solicitado,
 * restando los ya ocupados en la base de datos.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: "Parámetro date requerido (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const wh = DEFAULT_WORKING_HOURS;
  const [year, month, day] = dateParam.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0=Dom … 6=Sáb

  // Día no hábil
  if (!wh.days.includes(dayOfWeek)) {
    return NextResponse.json({ slots: [] });
  }

  // Generar todos los slots del día
  const allSlots: string[] = [];
  for (let h = wh.startHour; h < wh.endHour; h += wh.slotMinutes / 60) {
    const hh = String(Math.floor(h)).padStart(2, "0");
    const mm = String((h % 1) * 60).padStart(2, "0");
    allSlots.push(`${hh}:${mm}`);
  }

  // Citas ya reservadas ese día (no canceladas)
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  const booked = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
    },
    select: { date: true },
  });

  const bookedSlots = new Set(
    booked.map((a) => {
      const d = new Date(a.date);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }),
  );

  const available = allSlots.filter((s) => !bookedSlots.has(s));

  return NextResponse.json({ slots: available });
}
