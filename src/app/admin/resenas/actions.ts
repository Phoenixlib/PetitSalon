"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendReviewRequestEmail } from "@/lib/email";
import { env } from "@/env";

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

export async function resendReviewRequestAction(reviewId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      appointment: {
        select: {
          dog: {
            select: {
              name: true,
              owner: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!review) throw new Error("Reseña no encontrada");

  const ownerEmail = review.appointment?.dog?.owner?.email;
  if (!ownerEmail) {
    throw new Error("El cliente no tiene un correo electrónico registrado.");
  }

  const baseUrl = env.APP_URL ?? env.NEXTAUTH_URL ?? "";
  const reviewUrl = `${baseUrl}/resena/${review.token}`;

  await sendReviewRequestEmail(ownerEmail, {
    ownerName: review.ownerName,
    petName: review.petName,
    reviewUrl,
  });
}

export async function getReviewsAction(
  type: "PENDING" | "APPROVED" | "REJECTED" | "WAITING",
  skip: number,
  take: number
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  let whereClause: any = {};
  if (type === "PENDING") {
    whereClause = { status: "PENDING", submittedAt: { not: null } };
  } else if (type === "APPROVED") {
    whereClause = { status: "APPROVED" };
  } else if (type === "REJECTED") {
    whereClause = { status: "REJECTED" };
  } else if (type === "WAITING") {
    whereClause = { status: "PENDING", submittedAt: null };
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      appointment: {
        select: {
          date: true,
          service: { select: { name: true } },
          dog: {
            select: {
              name: true,
              owner: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return reviews;
}

