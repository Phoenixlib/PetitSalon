"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Owner, Dog } from "@prisma/client";
import { Pagination } from "@/components/ui/Pagination";

interface OwnerWithDogs extends Owner {
  dogs: Dog[];
}

interface Props {
  initialOwners: OwnerWithDogs[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentSearch: string;
}

export default function ClientesClient({
  initialOwners,
  currentPage,
  totalPages,
  totalCount,
  currentSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  // Sincronizar estado local al cambiar props
  useEffect(() => {
    setOwners(initialOwners);
  }, [initialOwners]);

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
            Clientes
          </h1>
          <Link
            href="/admin/clientes/nuevo"
            className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm lg:text-base whitespace-nowrap"
          >
            + <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Cliente</span>
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
            placeholder="Buscar por nombre, teléfono o email..."
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
                      {owner.dogs.map((dog) => (
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
                    <Link
                      href={`/admin/clientes/${owner.id}`}
                      className="text-[var(--primary)] hover:underline font-medium text-xs"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="lg:hidden flex flex-col divide-y divide-neutral-200">
          {owners.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No hay clientes registrados aún.
            </div>
          ) : (
            owners.map((owner) => (
              <div key={owner.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-base text-gray-900">
                      {owner.name}
                    </h3>
                    <div className="text-sm text-neutral-600 mt-0.5">
                      <a
                        href={`tel:${owner.phone}`}
                        className="hover:underline text-blue-600"
                      >
                        {owner.phone}
                      </a>
                      {owner.email && (
                        <span className="block text-xs text-neutral-400">
                          {owner.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {owner.dogs.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {owner.dogs.map((dog) => (
                      <span
                        key={dog.id}
                        className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-200"
                      >
                        {dog.name}{" "}
                        <span className="text-orange-600 opacity-80">
                          ({dog.breed})
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 pt-3 border-t border-neutral-100 flex justify-end">
                  <Link
                    href={`/admin/clientes/${owner.id}`}
                    className="inline-flex items-center justify-center bg-[var(--primary)] text-white hover:opacity-90 transition-opacity font-medium text-sm px-4 py-2 rounded-lg w-full"
                  >
                    Ver ficha del cliente
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
