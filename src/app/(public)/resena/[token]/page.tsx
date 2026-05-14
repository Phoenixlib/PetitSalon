import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

export const metadata = { title: "Deja tu reseña — Petit Salon" };

export default async function ResenaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const review = await prisma.review.findUnique({
    where: { token },
    select: {
      id: true,
      ownerName: true,
      petName: true,
      submittedAt: true,
    },
  });

  if (!review) notFound();

  // Token ya usado — mostrar agradecimiento
  if (review.submittedAt) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-6xl">🐾</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
          ¡Gracias por tu reseña!
        </h1>
        <p className="text-gray-600 max-w-sm">
          Ya recibimos tu opinión sobre la experiencia de{" "}
          <strong>{review.petName}</strong>. ¡Nos hace muy felices leerte!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <ReviewForm
        reviewId={review.id}
        ownerName={review.ownerName}
        petName={review.petName}
      />
    </main>
  );
}
