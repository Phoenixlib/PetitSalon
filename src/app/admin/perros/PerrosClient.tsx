"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Owner, Dog } from "@prisma/client";
import { Pagination } from "@/components/ui/Pagination";

interface DogWithRelations extends Dog {
  owner: Owner;
  _count: {
    attendances: number;
  };
}

interface Props {
  initialDogs: DogWithRelations[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentSearch: string;
}

export default function PerrosClient({
  initialDogs,
  currentPage,
  totalPages,
  totalCount,
  currentSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [dogs, setDogs] = useState(initialDogs);
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  // Sincronizar estado local al cambiar props
  useEffect(() => {
    setDogs(initialDogs);
  }, [initialDogs]);

  // Debounce search
  useEffect(() => {
    if (search === currentSearch) return;

    const timer = setTimeout(() => {
      updateUrl({ q: search, page: 1 });
    }, 400);

    return () => clearTimeout(timer);
  }, [search, currentSearch]);

  const updateUrl = (params: { page?: number; q?: string }) => {
    const newParams = new URLSearchParams(window.location.search);

    if (params.page !== undefined) {
      if (params.page > 1) {
        newParams.set("page", params.page.toString());
      } else {
        newParams.delete("page");
      }
    }

    if (params.q !== undefined) {
      if (params.q.trim()) {
        newParams.set("q", params.q.trim());
        newParams.delete("page");
      } else {
        newParams.delete("q");
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Indicador de carga sutil e interactivo arriba */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 animate-pulse z-50" />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Perros
          </h1>
          <Link
            href="/admin/clientes/nuevo"
            className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm lg:text-base whitespace-nowrap"
          >
            + <span className="hidden sm:inline">Nuevo Registro</span>
            <span className="sm:hidden">Registro</span>
          </Link>
        </div>

        <div className="relative w-full lg:max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, raza o dueño..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Desktop Table */}
        <table className="hidden lg:table w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="p-4 font-semibold text-neutral-600">Perro</th>
              <th className="p-4 font-semibold text-neutral-600">Raza/Peso</th>
              <th className="p-4 font-semibold text-neutral-600">Dueño</th>
              <th className="p-4 font-semibold text-neutral-600 text-center">
                Atenciones
              </th>
              <th className="p-4 font-semibold text-neutral-600 text-right">
                Acciones
              </th>
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
                          <img
                            src={dog.photo}
                            alt={dog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🐾"
                        )}
                      </div>
                      <span className="font-bold text-base">{dog.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium">{dog.breed}</span>
                    <span className="text-xs text-neutral-500">
                      Peso: {dog.weight || "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/clientes/${dog.owner.id}`}
                      className="text-[var(--primary)] hover:underline font-medium"
                    >
                      {dog.owner.name}
                    </Link>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      {dog._count.attendances}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/perros/${dog.id}`}
                      className="text-[var(--primary)] hover:underline font-medium text-xs"
                    >
                      Ver Ficha →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="lg:hidden flex flex-col divide-y divide-neutral-200">
          {dogs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No se encontraron perros.
            </div>
          ) : (
            dogs.map((dog) => (
              <div key={dog.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center text-2xl shrink-0 overflow-hidden shadow-sm border border-neutral-200">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {dog.name}
                      </h3>
                      <span
                        className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs shrink-0"
                        title="Atenciones previas"
                      >
                        ★ {dog._count.attendances}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 truncate">
                      {dog.breed}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Peso: {dog.weight || "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <span className="text-xs text-neutral-500 uppercase font-semibold">
                    Dueño
                  </span>
                  <Link
                    href={`/admin/clientes/${dog.owner.id}`}
                    className="block mt-0.5 text-sm text-[var(--primary)] hover:underline font-medium truncate"
                  >
                    {dog.owner.name}
                  </Link>
                </div>

                <div className="mt-1 pt-2">
                  <Link
                    href={`/admin/perros/${dog.id}`}
                    className="inline-flex items-center justify-center bg-[var(--primary)] text-white hover:opacity-90 transition-opacity font-medium text-sm px-4 py-2 rounded-lg w-full"
                  >
                    Ver ficha de la mascota
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(page) => updateUrl({ page })}
        isPending={isPending}
      />
    </div>
  );
}
