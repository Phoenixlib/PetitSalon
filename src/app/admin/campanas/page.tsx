import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CampanaComposer from "./CampanaComposer";

export const metadata = { title: "Campañas de Email | Petit Salon Admin" };

export default async function CampanasPage() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  // Solo clientes con email registrado pueden recibir campañas
  const clients = await prisma.owner.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true },
  });

  const withEmail = clients.filter((c): c is typeof c & { email: string } =>
    !!c.email,
  );

  const withoutEmail = clients.filter((c) => !c.email);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--ps-text)" }}
        >
          Campañas de Email
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
          Escribe y envía un mensaje personalizado a tus clientes.
        </p>
      </div>

      {withoutEmail.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️{" "}
          <strong>{withoutEmail.length}</strong>{" "}
          {withoutEmail.length === 1 ? "cliente no tiene" : "clientes no tienen"} email
          registrado y no recibirán la campaña.
        </div>
      )}

      <CampanaComposer clients={withEmail} />
    </div>
  );
}
