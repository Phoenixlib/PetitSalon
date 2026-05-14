"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendCampaignEmail } from "@/lib/email";
import { z } from "zod";

const CampaignSchema = z.object({
  subject: z.string().min(1, "El asunto es obligatorio").max(200),
  htmlBody: z.string().min(10, "El mensaje es demasiado corto"),
  recipientIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos un destinatario"),
});

export type CampaignState = {
  errors?: {
    subject?: string[];
    htmlBody?: string[];
    recipientIds?: string[];
    _form?: string[];
  };
  success?: boolean;
  sent?: number;
  failed?: number;
};

export async function sendCampaignAction(
  _prevState: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  const session = await auth();
  if (!session?.user) return { errors: { _form: ["No autorizado"] } };

  const subject = formData.get("subject") as string;
  const htmlBody = formData.get("htmlBody") as string;
  const recipientIds = formData.getAll("recipientIds") as string[];

  const parsed = CampaignSchema.safeParse({ subject, htmlBody, recipientIds });
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      errors: {
        subject: fieldErrors.subject,
        htmlBody: fieldErrors.htmlBody,
        recipientIds: fieldErrors.recipientIds,
      },
    };
  }

  // Obtener los emails reales desde la BD (nunca confiar en el cliente)
  const owners = await prisma.owner.findMany({
    where: { id: { in: parsed.data.recipientIds }, email: { not: null } },
    select: { name: true, email: true },
  });

  let sent = 0;
  let failed = 0;

  for (const owner of owners) {
    if (!owner.email) continue;
    try {
      await sendCampaignEmail(owner.email, {
        ownerName: owner.name,
        subject: parsed.data.subject,
        htmlBody: parsed.data.htmlBody,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return { success: true, sent, failed };
}
