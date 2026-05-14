"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SubmitSchema = z.object({
  text: z.string().min(20, "El comentario debe tener al menos 20 caracteres"),
});

export type SubmitReviewState = {
  errors?: { _form?: string[] };
  success: boolean;
};

export async function submitReviewAction(
  reviewId: string,
  rating: number,
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const text = formData.get("text") as string;

  const parsed = SubmitSchema.safeParse({ text });
  if (!parsed.success) {
    return {
      success: false,
      errors: { _form: parsed.error.flatten().formErrors },
    };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, errors: { _form: ["Selecciona una valoración"] } };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { submittedAt: true },
  });

  if (!review) return { success: false, errors: { _form: ["Reseña no encontrada"] } };
  if (review.submittedAt) return { success: false, errors: { _form: ["Esta reseña ya fue enviada"] } };

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      text: parsed.data.text.trim(),
      rating,
      submittedAt: new Date(),
    },
  });

  return { success: true };
}
