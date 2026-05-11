"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientWithDog } from "../actions";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Validate empty required
    if (
      !formData.get("name") ||
      !formData.get("phone") ||
      !formData.get("dogName") ||
      !formData.get("dogBreed")
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }

    const {
      error: submitError,
      success,
      ownerId,
    } = await createClientWithDog(formData);

    if (submitError) {
      setError(submitError);
      setLoading(false);
    } else if (success) {
      router.push(`/admin/clientes`);
      // If we had a detail page like `/admin/clientes/${ownerId}` we could redirect there
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Nuevo Cliente y Mascota
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-neutral-200"
      >
        {/* Sección Dueño */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--ps-text)] border-b pb-2">
            1. Datos del Dueño
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Nombre Completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="ej. Juan Pérez"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Teléfono *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+56 9 1234 5678"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ej. juan@correo.com"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Sección Mascota */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--ps-text)] border-b pb-2">
            2. Primera Mascota
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dogName"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Nombre del Perro *
              </label>
              <input
                id="dogName"
                name="dogName"
                type="text"
                required
                placeholder="ej. Max"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="dogBreed"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Raza *
              </label>
              <input
                id="dogBreed"
                name="dogBreed"
                type="text"
                required
                placeholder="ej. Poodle"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="dogSize"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Tamaño
              </label>
              <select
                id="dogSize"
                name="dogSize"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white"
              >
                <option value="XS">Extra Pequeño (XS)</option>
                <option value="S">Pequeño (S)</option>
                <option value="M" defaultValue="M">
                  Mediano (M)
                </option>
                <option value="L">Grande (L)</option>
                <option value="XL">Extra Grande (XL)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="dogAge"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Edad
                </label>
                <input
                  id="dogAge"
                  name="dogAge"
                  type="text"
                  placeholder="ej. 2 años"
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="dogWeight"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Peso
                </label>
                <input
                  id="dogWeight"
                  name="dogWeight"
                  type="text"
                  placeholder="ej. 5 kg"
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="dogNotes"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Notas Médicas o Comportamiento
              </label>
              <textarea
                id="dogNotes"
                name="dogNotes"
                rows={3}
                placeholder="Alergias, miedos, condiciones de salud, etc."
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cliente y Mascota"}
          </button>
        </div>
      </form>
    </div>
  );
}
