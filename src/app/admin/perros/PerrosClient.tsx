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
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/clientes/${dog.owner.id}`}
                        className="text-[var(--primary)] hover:underline font-medium"
                      >
                        {dog.owner.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${dog.owner.phone}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {dog.owner.phone}
                        </a>
                        <a
                          href={`https://wa.me/${dog.owner.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="WhatsApp"
                        >
                          <svg
                            className="w-3.5 h-3.5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.008.01c-6.61 0-11.948 5.338-11.951 11.951 0 2.097.546 4.142 1.587 5.946l-1.687 6.163 6.31-1.654c1.751.953 3.719 1.454 5.724 1.455 6.613 0 11.949-5.34 11.953-11.997 0-3.204-1.239-6.216-3.505-8.484C18.22 1.256 15.21.011 12.008.01zm6.979 16.983c-1.861 1.862-4.332 2.886-6.979 2.888-1.637-.002-3.225-.501-4.825-1.451l-5.448 1.428 1.458-5.328c-.913-1.534-1.393-3.255-1.392-5.017.003-5.444 4.428-9.86 9.865-9.86 2.638 0 5.11.025 6.963 1.879 1.861 1.862 2.886 4.341 2.884 6.979-.004 5.444-4.426 9.863-9.862 9.861z" />
                          </svg>
                        </a>
                      </div>
                    </div>
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

                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 flex justify-between items-center">
                  <div>
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
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${dog.owner.phone}`}
                      className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      title="Llamar"
                    >
                      <svg
                        className="w-3.5 h-3.5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 16.5c-1.35 0-2.65-.21-3.85-.6-.35-.11-.75-.02-1.02.26l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C9.39 7.65 9.19 6.35 9.19 5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-4.19c0-.55-.45-1-1-1z" />
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${dog.owner.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      title="WhatsApp"
                    >
                      <svg
                        className="w-3.5 h-3.5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.008.01c-6.61 0-11.948 5.338-11.951 11.951 0 2.097.546 4.142 1.587 5.946l-1.687 6.163 6.31-1.654c1.751.953 3.719 1.454 5.724 1.455 6.613 0 11.949-5.34 11.953-11.997 0-3.204-1.239-6.216-3.505-8.484C18.22 1.256 15.21.011 12.008.01zm6.979 16.983c-1.861 1.862-4.332 2.886-6.979 2.888-1.637-.002-3.225-.501-4.825-1.451l-5.448 1.428 1.458-5.328c-.913-1.534-1.393-3.255-1.392-5.017.003-5.444 4.428-9.86 9.865-9.86 2.638 0 5.11.025 6.963 1.879 1.861 1.862 2.886 4.341 2.884 6.979-.004 5.444-4.426 9.863-9.862 9.861z" />
                      </svg>
                    </a>
                  </div>
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
