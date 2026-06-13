import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-cal-signature-256");
    
    const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;

    const payload = JSON.parse(body);

    console.log("[Cal.com Webhook] Received:", {
      trigger: payload?.triggerEvent,
      headers: Object.fromEntries(headersList.entries()),
      bodyPreview: body.substring(0, 200),
    });
    
    if (webhookSecret) {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret.trim())
        .update(body)
        .digest("hex");
      
      if (signature !== expectedSig) {
        console.error("[Cal.com Webhook] Signature mismatch! Check CALCOM_WEBHOOK_SECRET");
        return new Response("Invalid signature", { status: 401 });
      }
    }
    
    if (payload.triggerEvent === "BOOKING_CREATED" || payload.triggerEvent === "BOOKING_RESCHEDULED") {
      const booking = payload.payload;
      
      if (payload.triggerEvent === "BOOKING_RESCHEDULED") {
        const newDate = new Date(booking.startTime);
        
        const existingAppt = await prisma.appointment.findUnique({
          where: { calComUid: String(booking.uid) }
        });
        
        if (existingAppt && Math.abs(existingAppt.date.getTime() - newDate.getTime()) < 60000) {
          console.log("[Cal.com Webhook] Reschedule already reflected locally, skipping DB update");
          return new Response("Already synced", { status: 200 });
        }
      }

      const attendee = booking.attendees?.[0];
      
      if (!attendee) {
        return new Response("Missing attendee", { status: 400 });
      }

      const cleanPhone = (phone: string): string => {
        let clean = phone.replace(/[^\d+]/g, '');
        if (clean.length === 9 && clean.startsWith('9')) {
          clean = '+56' + clean;
        } else if (clean.length === 11 && clean.startsWith('569')) {
          clean = '+' + clean;
        } else if (clean.length === 8) {
          clean = '+569' + clean;
        }
        if (/^\+569\d{8}$/.test(clean)) return clean;
        if (/^\+\d{10,15}$/.test(clean)) return clean;
        return clean || "+56900000000";
      };

      let rawPhone = attendee.phone || booking.responses?.phone?.value || booking.responses?.telefono?.value || booking.responses?.attendeePhoneNumber?.value;
      const ownerPhone = rawPhone ? cleanPhone(String(rawPhone)) : "+56900000000";
      const ownerName = attendee.name || "Dueño sin nombre";

      let owner = attendee.email 
        ? await prisma.owner.findUnique({ where: { email: attendee.email } })
        : null;

      if (!owner && attendee.phone) {
        owner = await prisma.owner.findUnique({ where: { phone: ownerPhone } });
      }

      if (!owner) {
        try {
          owner = await prisma.owner.create({
            data: {
              name: ownerName,
              email: attendee.email || null,
              phone: ownerPhone,
            },
          });
        } catch (e: any) {
          if (e.code === "P2002") {
            owner = await prisma.owner.findFirst({
              where: {
                OR: [
                  { email: attendee.email || undefined },
                  { phone: ownerPhone },
                ],
              },
            });
            if (!owner) throw e;
          } else {
            throw e;
          }
        }
      } else {
        await prisma.owner.update({
          where: { id: owner.id },
          data: {
            ...(owner.email ? {} : { email: attendee.email || null }),
            name: owner.name === "Dueño sin nombre" ? ownerName : owner.name
          },
        });
      }

      const dogName = booking.responses?.nombre_perro?.value || "Perro sin nombre";
      const dogBreed = booking.responses?.raza_perro?.value || "Mestizo";
      const dogAge = booking.responses?.edad?.value || null;
      const dogWeight = booking.responses?.peso?.value || null;
      const dogNotes = booking.responses?.dog_notes?.value || null;

      let dog = await prisma.dog.findFirst({
        where: { ownerId: owner.id, name: String(dogName) }
      });

      if (!dog) {
        try {
          dog = await prisma.dog.create({
            data: {
              name: String(dogName),
              breed: String(dogBreed),
              age: dogAge ? String(dogAge) : null,
              weight: dogWeight ? String(dogWeight) : null,
              notes: dogNotes ? String(dogNotes) : null,
              ownerId: owner.id
            }
          });
        } catch (e: any) {
          if (e.code === "P2002") {
            dog = await prisma.dog.findFirst({
              where: { ownerId: owner.id, name: String(dogName) }
            });
            if (!dog) throw e;
          } else {
            throw e;
          }
        }
      }

      let serviceId: string | null = null;
      if (booking.eventTypeId) {
        const service = await prisma.service.findFirst({
          where: { calComEventTypeId: Number(booking.eventTypeId) }
        });
        serviceId = service?.id || null;
      }

      if (!serviceId) {
        const fallbackService = await prisma.service.findFirst({ orderBy: { order: 'asc' } });
        if (fallbackService) {
          serviceId = fallbackService.id;
        } else {
          return new Response("No service found to map appointment", { status: 400 });
        }
      }

      try {
        const existingAppt = await prisma.appointment.findUnique({
          where: { calComUid: String(booking.uid) },
        });

        if (existingAppt) {
          await prisma.appointment.update({
            where: { id: existingAppt.id },
            data: {
              date: new Date(booking.startTime),
              notes: booking.responses?.notes?.value || booking.responses?.dog_notes?.value || existingAppt.notes,
              serviceId,
              dogId: dog.id
            },
          });
        } else {
          await prisma.appointment.create({
            data: {
              calComUid: String(booking.uid),
              date: new Date(booking.startTime),
              status: "CONFIRMED",
              serviceId,
              dogId: dog.id,
              notes: booking.responses?.notes?.value || booking.responses?.dog_notes?.value || null,
            },
          });
        }
      } catch (err) {
        console.error("UPSERT ERROR:", err);
        throw err;
      }
    } else if (payload.triggerEvent === "BOOKING_CANCELLED") {
      const booking = payload.payload;
      
      try {
        await prisma.appointment.update({
          where: { calComUid: String(booking.uid) },
          data: {
            status: "CANCELLED",
          },
        });
      } catch (err) {
        console.error("UPDATE ERROR in CANCELLED:", err);
      }
    }

    console.log("[Cal.com Webhook] Successfully processed:", payload.triggerEvent);
    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing Cal.com webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
