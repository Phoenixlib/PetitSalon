import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
import DogDetailClient from "./DogDetailClient";

export default async function DogDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const dog = await prisma.dog.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      attendances: {
        orderBy: { date: "desc" },
      },
      appointments: {
        where: {
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
          },
        },
        include: {
          service: true,
          dog: {
            include: {
              owner: true,
            },
          },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!dog) notFound();

  return (
    <div className="space-y-6">
      <DogDetailClient dog={dog} services={services} />
    </div>
  );
}
