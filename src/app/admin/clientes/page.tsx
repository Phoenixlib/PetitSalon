import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Dog } from "@prisma/client";

export default async function ClientesPage() {
  const owners = await prisma.owner.findMany({
    include: {
      dogs: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
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
                    <button className="text-[var(--primary)] hover:underline font-medium text-xs">
                      Ver detalle
                    </button>
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
