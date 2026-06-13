import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createCalComScheduleOverride,
  deleteCalComScheduleOverride,
  getCalComVirtualBlockedSlots,
} from "@/lib/calcom";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    if (!startStr || !endStr) {
      return NextResponse.json({ error: "Missing start or end parameters" }, { status: 400 });
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    const localBlocks = await prisma.blockedSlot.findMany({
      where: {
        startAt: { gte: startDate },
        endAt: { lte: endDate },
      },
      orderBy: { startAt: "asc" },
    });

    const virtualBlocks = await getCalComVirtualBlockedSlots(startDate, endDate);

    const localBlocksMapped = localBlocks.map((lb) => ({
      ...lb,
      isVirtual: false,
    }));

    const mergedBlocks = [...localBlocksMapped];

    for (const virtual of virtualBlocks) {
      const existsLocal = localBlocks.some(
        (lb) =>
          Math.abs(lb.startAt.getTime() - virtual.startAt.getTime()) < 60000 &&
          Math.abs(lb.endAt.getTime() - virtual.endAt.getTime()) < 60000
      );

      if (!existsLocal) {
        mergedBlocks.push({
          id: virtual.id,
          startAt: virtual.startAt,
          endAt: virtual.endAt,
          reason: virtual.reason,
          calComOverrideId: null,
          createdAt: new Date(),
          isVirtual: true,
        });
      }
    }

    mergedBlocks.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

    return NextResponse.json(mergedBlocks);
  } catch (error) {
    console.error("Error in GET /api/admin/blocked-slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { startAt, endAt, reason } = body;

    if (!startAt || !endAt) {
      return NextResponse.json({ error: "Missing startAt or endAt parameters" }, { status: 400 });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    let calComOverrideId: number | null = null;
    let warning: string | null = null;

    const scheduleIdStr = process.env.CALCOM_SCHEDULE_ID;
    if (scheduleIdStr) {
      try {
        calComOverrideId = await createCalComScheduleOverride(scheduleIdStr, startDate, endDate);
      } catch (err: any) {
        console.error("Warning: Cal.com schedule override creation failed, proceeding with local block:", err);
        warning = err.message || "No se pudo sincronizar el bloqueo con Cal.com, pero se guardó localmente.";
      }
    } else {
      warning = "CALCOM_SCHEDULE_ID no configurado. El bloqueo es solo local.";
    }

    const slot = await prisma.blockedSlot.create({
      data: {
        startAt: startDate,
        endAt: endDate,
        reason: reason || "Bloqueo administrativo",
        calComOverrideId: calComOverrideId,
      },
    });

    return NextResponse.json({ ...slot, warning });
  } catch (error: any) {
    console.error("Error creating blocked slot:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    if (id.startsWith("virtual_")) {
      const parts = id.split("_");
      let warning: string | null = null;
      const scheduleIdStr = process.env.CALCOM_SCHEDULE_ID;
      
      if (parts.length === 3 && scheduleIdStr) {
        const startAt = new Date(parseInt(parts[1]!, 10));
        const endAt = new Date(parseInt(parts[2]!, 10));

        try {
          await deleteCalComScheduleOverride(scheduleIdStr, startAt, endAt);
          return NextResponse.json({
            id,
            startAt,
            endAt,
            reason: "Virtual",
            calComOverrideId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            warning: null,
          });
        } catch (err: any) {
          console.error("Failed to delete virtual block in Cal.com", err);
          warning = "Hubo un error eliminando la anulación directamente en Cal.com.";
        }
      }
      return NextResponse.json({
        id,
        startAt: new Date(),
        endAt: new Date(),
        reason: "Virtual",
        calComOverrideId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        warning: warning ?? "No se pudo identificar el bloqueo. Por favor, elimínalo directamente en tu panel de Cal.com.",
      });
    }

    const slot = await prisma.blockedSlot.findUnique({ where: { id } });
    if (!slot) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    let warning: string | null = null;
    const scheduleIdStr = process.env.CALCOM_SCHEDULE_ID;

    if (scheduleIdStr) {
      try {
        await deleteCalComScheduleOverride(scheduleIdStr, slot.startAt, slot.endAt);
      } catch (err: any) {
        console.error("Warning: Cal.com schedule override deletion failed, proceeding with local deletion:", err);
        warning = err.message || "No se pudo eliminar el bloqueo en Cal.com, pero se eliminó localmente.";
      }
    }

    const deletedSlot = await prisma.blockedSlot.delete({ where: { id } });

    return NextResponse.json({ ...deletedSlot, warning });
  } catch (error) {
    console.error("Error in DELETE /api/admin/blocked-slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
