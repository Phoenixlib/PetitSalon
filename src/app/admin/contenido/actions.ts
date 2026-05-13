"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

export async function updateSiteConfigAction(key: string, value: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin();
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
