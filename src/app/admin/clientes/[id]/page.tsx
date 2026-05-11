import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Dog, DogSize } from "@prisma/client";

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const owner = await prisma.owner.findUnique({
    where: { id: params.id },
    include: { dogs: true },
  });

  if (!owner) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clientes" className="text-neutral-500 hover:text-neutral-700">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Ficha del Cliente</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner Details */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:col-span-1 h-fit">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Datos del Dueño</h2>
            <button className="text-sm text-[var(--primary)] hover:underline">
              Editar
            </button>
          </div>
          
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-neutral-500 font-medium">Nombre</dt>
              <dd className="font-medium text-lg">{owner.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 font-medium">Teléfono</dt>
              <dd>{owner.phone}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 font-medium">Email</dt>
              <dd>{owner.email || "No registrado"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 font-medium">Registrado el</dt>
              <dd>{owner.createdAt.toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Dogs List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mascotas ({owner.dogs.length})</h2>
            <button className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors">
              + Agregar Mascota
            </button>
          </div>

          <div className="grid gap-4">
            {owner.dogs.map((dog) => (
              <div key={dog.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                  {dog.photo ? (
                    <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    "🐾"
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{dog.name}</h3>
                      <p className="text-neutral-600">{dog.breed}</p>
                    </div>
                    <Link
                      href={`/admin/perros/${dog.id}`}
                      className="text-sm font-medium bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors border border-neutral-200"
                    >
                      Ver Ficha
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500 block mb-1">Tamaño</span>
                      <span className="font-medium bg-neutral-100 px-2 py-1 rounded-md">{dog.size || "-"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Peso</span>
                      <span className="font-medium">{dog.weight || "-"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Edad</span>
                      <span className="font-medium">{dog.age || "-"}</span>
                    </div>
                  </div>

                  {dog.notes && (
                    <div className="mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <p className="text-sm text-orange-900 font-medium">Notas:</p>
                      <p className="text-sm text-orange-800 mt-1">{dog.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {owner.dogs.length === 0 && (
              <div className="text-center p-8 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
                <p className="text-neutral-500">Este cliente no tiene mascotas registradas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
