"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateReviewStatusAction(reviewId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await prisma.review.update({
    where: { id: reviewId },
    data: { status },
  });

  revalidatePath("/admin/resenas");
  revalidatePath("/"); // revalidar el landing
}

export async function deleteReviewAction(reviewId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  await prisma.review.delete({
    where: { id: reviewId },
  });

  revalidatePath("/admin/resenas");
  revalidatePath("/");
}
