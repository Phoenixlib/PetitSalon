import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ReviewCard from "./ReviewCard";

export const metadata = { title: "Reseñas | Petit Salon Admin" };

export default async function AdminResenasPage() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
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

  const pending = reviews.filter((r) => r.status === "PENDING" && r.submittedAt);
  const approved = reviews.filter((r) => r.status === "APPROVED");
  const rejected = reviews.filter((r) => r.status === "REJECTED");
  const waiting = reviews.filter((r) => r.status === "PENDING" && !r.submittedAt);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--ps-text)" }}>
        Moderación de Reseñas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Column title="Nuevas (Pendientes)" reviews={pending} badgeColor="bg-amber-100 text-amber-800" />
        <Column title="Aprobadas (Landing)" reviews={approved} badgeColor="bg-emerald-100 text-emerald-800" />
        <Column title="Rechazadas" reviews={rejected} badgeColor="bg-red-100 text-red-800" />
        <Column title="Esperando al cliente" reviews={waiting} badgeColor="bg-gray-100 text-gray-800" />
      </div>
    </div>
  );
}

function Column({ title, reviews, badgeColor }: { title: string; reviews: any[]; badgeColor: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
          {reviews.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay reseñas aquí.</p>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </div>
  );
}
