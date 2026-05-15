"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalComEmbed, { CalComPrefill } from "./CalComEmbed";

type Step = "lookup" | "dog-select" | "embed";

interface Dog {
  id: string;
  name: string;
  breed: string;
  size?: string | null;
}

interface Owner {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

interface BookingFlowProps {
  calLink: string;
  servicio?: string;
}

export default function BookingFlow({ calLink, servicio }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [owner, setOwner] = useState<Owner | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [prefill, setPrefill] = useState<CalComPrefill | undefined>(
    servicio ? { servicio } : undefined,
  );

  // New dog form
  const [showNewDogForm, setShowNewDogForm] = useState(false);
  const [newDog, setNewDog] = useState({ name: "", breed: "", size: "M" });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const isEmail = query.includes("@");
      const url = new URL("/api/booking/lookup", window.location.origin);
      if (isEmail) {
        url.searchParams.append("email", query);
      } else {
        url.searchParams.append("phone", query);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Error en la búsqueda");

      const data = await res.json();
      if (data.found) {
        setOwner(data.owner);
        setDogs(data.dogs);
        setStep("dog-select");
      } else {
        // No encontrado -> Ir a embed
        setStep("embed");
      }
    } catch (err) {
      console.error(err);
      setError(
        "No pudimos buscar tu información. Por favor, continúa como invitado.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setStep("embed");
  };

  const handleSelectDog = (dog: Dog) => {
    setPrefill({
      name: owner?.name || "",
      email: owner?.email || "",
      attendeePhoneNumber: owner?.phone || "",
      nombre_perro: dog.name,
      raza_perro: dog.breed,
      dog_size: dog.size || "",
      servicio: servicio || "",
    });
    setStep("embed");
  };

  const handleAddNewDog = () => {
    if (!newDog.name || !newDog.breed) {
      setError("Nombre y raza son requeridos para el nuevo perrito.");
      return;
    }
    setPrefill({
      name: owner?.name || "",
      email: owner?.email || "",
      attendeePhoneNumber: owner?.phone || "",
      nombre_perro: newDog.name,
      raza_perro: newDog.breed,
      dog_size: newDog.size,
      servicio: servicio || "",
    });
    setStep("embed");
  };

  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="w-full relative min-h-[400px]">
      {!isSuccess && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Reserva tu Cita
          </h1>
          <p className="text-muted-foreground">
            Elige el servicio, día y hora que más te acomode. Recibirás una
            confirmación por correo.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "lookup" && (
          <motion.div
            key="lookup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[var(--ps-border,neutral-200)] mt-8"
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display, inherit)" }}
            >
              ¿Ya eres cliente de Petit Salón?
            </h2>
            <p className="text-[var(--ps-text-mid)] mb-6">
              Ingresa tu correo o teléfono para agilizar tu reserva con los
              datos de tus perritos.
            </p>
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="ej. juan@correo.com o +569..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--ps-border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white p-3 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Buscar Cuenta"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-[var(--ps-text-mid)] underline hover:text-[var(--ps-text)]"
              >
                Primera vez, quiero reservar directamente
              </button>
            </div>
          </motion.div>
        )}

        {step === "dog-select" && (
          <motion.div
            key="dog-select"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[var(--ps-border,neutral-200)] mt-8"
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display, inherit)" }}
            >
              ¡Hola {owner?.name.split(" ")[0]}!
            </h2>
            <p className="text-[var(--ps-text-mid)] mb-6">
              ¿Cuál de tus perritos viene hoy?
            </p>

            <div className="space-y-3 mb-6">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => handleSelectDog(dog)}
                  className="w-full p-4 text-left border border-[var(--ps-border)] rounded-xl hover:border-[var(--primary)] hover:bg-orange-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="block font-medium">{dog.name}</span>
                    <span className="block text-sm text-[var(--ps-text-mid)]">
                      {dog.breed} {dog.size ? `(${dog.size})` : ""}
                    </span>
                  </div>
                  <span className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Seleccionar →
                  </span>
                </button>
              ))}
            </div>

            {!showNewDogForm ? (
              <button
                onClick={() => setShowNewDogForm(true)}
                className="w-full border-2 border-dashed border-[var(--ps-border)] p-3 rounded-xl text-[var(--ps-text-mid)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors font-medium text-sm"
              >
                + Agregar nuevo perrito
              </button>
            ) : (
              <div className="pt-4 border-t border-[var(--ps-border)] mt-4">
                <h3 className="font-medium mb-3">Datos del nuevo perrito</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newDog.name}
                    onChange={(e) =>
                      setNewDog({ ...newDog, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[var(--ps-border)] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Raza"
                    value={newDog.breed}
                    onChange={(e) =>
                      setNewDog({ ...newDog, breed: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[var(--ps-border)] text-sm"
                  />
                  <select
                    value={newDog.size}
                    onChange={(e) =>
                      setNewDog({ ...newDog, size: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[var(--ps-border)] text-sm bg-white"
                  >
                    <option value="XS">Extra Pequeño (XS)</option>
                    <option value="S">Pequeño (S)</option>
                    <option value="M">Mediano (M)</option>
                    <option value="L">Grande (L)</option>
                    <option value="XL">Extra Grande (XL)</option>
                  </select>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewDogForm(false)}
                      className="flex-1 p-2 rounded-full border border-[var(--ps-border)] text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddNewDog}
                      className="flex-1 p-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium"
                    >
                      Guardar y Seguir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === "embed" && (
          <motion.div
            key="embed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[var(--ps-border,neutral-200)] p-4 sm:p-8"
          >
            <CalComEmbed 
              calLink={calLink} 
              prefill={prefill} 
              onSuccess={() => setIsSuccess(true)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
