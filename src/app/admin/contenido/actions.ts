"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

function validateRut(rut: string): boolean {
  const cleanRut = rut.replace(/[^0-9kK]/g, "");
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();
  
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  let expectedDvStr = "";
  if (expectedDv === 11) expectedDvStr = "0";
  else if (expectedDv === 10) expectedDvStr = "k";
  else expectedDvStr = expectedDv.toString();
  
  return dv === expectedDvStr;
}

export async function updateSiteConfigAction(key: string, value: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin();

    // Validaciones del servidor
    if (key === "whatsapp") {
      if (value !== "") {
        const whatsappRegex = /^\d{9,15}$/;
        if (!whatsappRegex.test(value)) {
          return { error: "El número de WhatsApp debe contener solo dígitos y tener entre 9 y 15 caracteres." };
        }
      }
    } else if (key === "email" || key === "bank_email") {
      if (value !== "") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          return { error: "El correo electrónico no es válido. Debe tener un formato correcto (ej: usuario@dominio.com)." };
        }
      }
    } else if (key === "bank_rut") {
      if (value !== "") {
        if (!validateRut(value)) {
          return { error: "El RUT ingresado no es válido. Debe ser un RUT chileno real (ej: 12.345.678-9)." };
        }
      }
    } else if (key === "bank_account_number") {
      if (value !== "") {
        const accountNumberRegex = /^[0-9\s\-]{5,30}$/;
        if (!accountNumberRegex.test(value)) {
          return { error: "El número de cuenta debe contener solo dígitos, espacios o guiones (entre 5 y 30 caracteres)." };
        }
      }
    }

    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar la configuración." };
  }
}

const FaqSchema = z.object({
  question: z.string().min(1, "La pregunta es obligatoria").max(500),
  answer: z.string().min(1, "La respuesta es obligatoria").max(2000),
});

export type FaqFormState = {
  errors?: {
    question?: string[];
    answer?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createFaqAction(_prev: FaqFormState, formData: FormData): Promise<FaqFormState> {
  try {
    await requireAdmin();
    const raw = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
    };
    const parsed = FaqSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }
    
    const maxOrderFaq = await prisma.faqItem.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = maxOrderFaq ? maxOrderFaq.order + 1 : 0;

    await prisma.faqItem.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        order: nextOrder,
      },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al crear la pregunta."] } };
  }
}

export async function updateFaqAction(id: string, _prev: FaqFormState, formData: FormData): Promise<FaqFormState> {
  try {
    await requireAdmin();
    const raw = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
    };
    const parsed = FaqSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }
    
    await prisma.faqItem.update({
      where: { id },
      data: parsed.data,
    });
    
    revalidatePath("/");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al actualizar la pregunta."] } };
  }
}

export async function toggleFaqAction(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await prisma.faqItem.update({ where: { id }, data: { isActive } });
  revalidatePath("/");
}

export async function deleteFaqAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/");
}

export async function reorderFaqAction(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  
  await prisma.$transaction(
    orderedIds.map((id, index) => 
      prisma.faqItem.update({
        where: { id },
        data: { order: index },
      })
    )
  );
  
  revalidatePath("/");
}
