import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCalComScheduleAvailability } from "@/lib/calcom";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await getCalComScheduleAvailability();
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error in GET /api/admin/availability-rules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
