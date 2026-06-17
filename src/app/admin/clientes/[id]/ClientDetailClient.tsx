"use client";

import { useState } from "react";
import Link from "next/link";
import OwnerModal from "@/components/admin/OwnerModal";
import AddDogModal from "@/components/admin/AddDogModal";
import DeleteDogModal from "@/components/admin/DeleteDogModal";
import { Dog } from "@prisma/client";
import { AnimatePresence } from "framer-motion";

export default function ClientDetailClient({
  owner,
  dogs,
}: {
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    createdAt: Date;
  };
  dogs: Dog[];
}) {
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isAddDogOpen, setIsAddDogOpen] = useState(false);
  const [dogToDelete, setDogToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clientes"
          className="text-neutral-500 hover:text-neutral-700"
        >
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Ficha del Cliente</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner Details */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:col-span-1 h-fit">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Datos del Dueño</h2>
            <button
              onClick={() => setIsOwnerOpen(true)}
              className="text-sm text-[var(--primary)] hover:underline"
            >
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
              <dd className="mt-1 flex items-center gap-3">
                <a
                  href={`tel:${owner.phone}`}
                  className="font-semibold text-[var(--ps-text)] hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <span className="bg-neutral-100 p-2 rounded-lg">📞</span>
                  {owner.phone}
                </a>
                <a
                  href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-green-200 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.862-9.861.002-2.638-1.023-5.117-2.884-6.979C16.592 1.905 14.12 1.88 11.482 1.88c-5.437 0-9.862 4.416-9.865 9.86-.001 1.762.479 3.483 1.392 5.017L1.93 22.07l5.448-1.428c1.554.848 3.238 1.293 4.962 1.293z" />
                  </svg>
                  WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 font-medium">Email</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="bg-neutral-100 p-2 rounded-lg">✉️</span>
                {owner.email || "No registrado"}
              </dd>
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
            <h2 className="text-xl font-semibold">Mascotas ({dogs.length})</h2>
            <button
              onClick={() => setIsAddDogOpen(true)}
              className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              + Agregar Mascota
            </button>
          </div>

          <div className="grid gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col md:flex-row gap-6"
              >
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                  {dog.photo ? (
                    <img
                      src={dog.photo}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDogToDelete({ id: dog.id, name: dog.name })}
                        className="text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                        title="Ocultar de la lista y evitar nuevas citas"
                      >
                        Archivar
                      </button>
                      <Link
                        href={`/admin/perros/${dog.id}`}
                        className="text-sm font-medium bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors border border-neutral-200"
                      >
                        Ver Ficha
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
                      <p className="text-sm text-orange-900 font-medium">
                        Notas:
                      </p>
                      <p className="text-sm text-orange-800 mt-1">
                        {dog.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {dogs.length === 0 && (
              <div className="text-center p-8 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
                <p className="text-neutral-500">
                  Este cliente no tiene mascotas registradas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOwnerOpen && (
          <OwnerModal
            owner={owner}
            isOpen={isOwnerOpen}
            onClose={() => setIsOwnerOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAddDogOpen && (
          <AddDogModal
            ownerId={owner.id}
            isOpen={isAddDogOpen}
            onClose={() => setIsAddDogOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dogToDelete && (
          <DeleteDogModal
            dogId={dogToDelete.id}
            dogName={dogToDelete.name}
            isOpen={!!dogToDelete}
            onClose={() => setDogToDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
