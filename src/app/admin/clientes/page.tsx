import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Dog } from "@prisma/client";

export default async function ClientesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() ?? "";
  const owners = await prisma.owner.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      dogs: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        
        <form method="GET" className="flex items-center relative mx-4 flex-1 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button type="submit" className="absolute right-3 text-neutral-400">
            🔍
          </button>
        </form>
        <Link
          href="/admin/clientes/nuevo"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          + Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 font-semibold text-neutral-600">Nombre</th>
              <th className="p-4 font-semibold text-neutral-600">Contacto</th>
              <th className="p-4 font-semibold text-neutral-600">Mascotas</th>
              <th className="p-4 font-semibold text-neutral-600 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {owners.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500">
                  No hay clientes registrados aún.
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-medium">{owner.name}</td>
                  <td className="p-4 text-neutral-600">
                    {owner.phone} <br />
                    <span className="text-xs text-neutral-400">
                      {owner.email || "Sin email"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {owner.dogs.map((dog: Dog) => (
                        <span
                          key={dog.id}
                          className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-200"
                        >
                          {dog.name} ({dog.breed})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/clientes/${owner.id}`} className="text-[var(--primary)] hover:underline font-medium text-xs">
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
