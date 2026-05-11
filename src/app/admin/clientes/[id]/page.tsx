import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDetailClient from "./ClientDetailClient";

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const owner = await prisma.owner.findUnique({
    where: { id: params.id },
    include: { dogs: true },
  });

  if (!owner) notFound();

  return (
    <div className="space-y-6">
      <ClientDetailClient owner={owner} dogs={owner.dogs} />
    </div>
  );
}
