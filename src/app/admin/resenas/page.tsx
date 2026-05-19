import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ReviewColumn from "./ReviewColumn";

export const metadata = { title: "Reseñas | Petit Salon Admin" };

const reviewInclude = {
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
};

export default async function AdminResenasPage() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const pendingWhere = { status: "PENDING" as const, submittedAt: { not: null } };
  const approvedWhere = { status: "APPROVED" as const };
  const rejectedWhere = { status: "REJECTED" as const };
  const waitingWhere = { status: "PENDING" as const, submittedAt: null };

  const [
    pendingCount,
    pendingReviews,
    approvedCount,
    approvedReviews,
    rejectedCount,
    rejectedReviews,
    waitingCount,
    waitingReviews,
  ] = await Promise.all([
    // Pendientes
    prisma.review.count({ where: pendingWhere }),
    prisma.review.findMany({
      where: pendingWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: reviewInclude,
    }),
    // Aprobadas
    prisma.review.count({ where: approvedWhere }),
    prisma.review.findMany({
      where: approvedWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: reviewInclude,
    }),
    // Rechazadas
    prisma.review.count({ where: rejectedWhere }),
    prisma.review.findMany({
      where: rejectedWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: reviewInclude,
    }),
    // Esperando al cliente
    prisma.review.count({ where: waitingWhere }),
    prisma.review.findMany({
      where: waitingWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: reviewInclude,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--ps-text)" }}>
        Moderación de Reseñas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ReviewColumn
          title="Nuevas (Pendientes)"
          initialReviews={pendingReviews}
          totalCount={pendingCount}
          badgeColor="bg-amber-100 text-amber-800"
          type="PENDING"
        />
        <ReviewColumn
          title="Aprobadas (Landing)"
          initialReviews={approvedReviews}
          totalCount={approvedCount}
          badgeColor="bg-emerald-100 text-emerald-800"
          type="APPROVED"
        />
        <ReviewColumn
          title="Rechazadas"
          initialReviews={rejectedReviews}
          totalCount={rejectedCount}
          badgeColor="bg-red-100 text-red-800"
          type="REJECTED"
        />
        <ReviewColumn
          title="Esperando al cliente"
          initialReviews={waitingReviews}
          totalCount={waitingCount}
          badgeColor="bg-gray-100 text-gray-800"
          type="WAITING"
        />
      </div>
    </div>
  );
}

