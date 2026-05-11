import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
import DogDetailClient from "./DogDetailClient";

export default async function DogDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const servicesP = prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const dogP = prisma.dog.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      attendances: {
        orderBy: { date: 'desc' }
      },
      appointments: {
        where: {
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
          }
        },
        include: { service: true },
        orderBy: { date: 'asc' }
      }
    },
  });

  const [dog, services] = await Promise.all([dogP, servicesP]);

  if (!dog) notFound();

  return (
    <div className="space-y-6">
      <DogDetailClient dog={dog} services={services} />
    </div>
  );
}
