import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PerrosPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() ?? "";

  const dogs = await prisma.dog.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { breed: { contains: q, mode: "insensitive" } },
            { owner: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      owner: true,
      _count: { select: { attendances: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Perros Registrados</h1>
        
        <form method="GET" className="flex items-center relative mx-4 flex-1 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, raza o dueño..."
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button type="submit" className="absolute right-3 text-neutral-400">
            🔍
          </button>
        </form>

        <Link
          href="/admin/clientes/nuevo"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Nuevo Registro
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 font-semibold text-neutral-600">Perro</th>
              <th className="p-4 font-semibold text-neutral-600">Raza/Tamaño</th>
              <th className="p-4 font-semibold text-neutral-600">Dueño</th>
              <th className="p-4 font-semibold text-neutral-600 text-center">Atenciones</th>
              <th className="p-4 font-semibold text-neutral-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {dogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No se encontraron perros.
                </td>
              </tr>
            ) : (
              dogs.map((dog) => (
                <tr key={dog.id} className="hover:bg-neutral-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {dog.photo ? (
                          <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
                        ) : (
                          "🐾"
                        )}
                      </div>
                      <span className="font-bold text-base">{dog.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium">{dog.breed}</span>
                    <span className="text-xs text-neutral-500">{dog.size || "-"} | {dog.weight || "-"}</span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/clientes/${dog.owner.id}`} className="text-[var(--primary)] hover:underline font-medium">
                      {dog.owner.name}
                    </Link>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      {dog._count.attendances}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/perros/${dog.id}`} className="text-[var(--primary)] hover:underline font-medium text-xs">
                      Ver Ficha →
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
