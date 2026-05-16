"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalComEmbed, { CalComPrefill } from "@/components/booking/CalComEmbed";
import Link from "next/link";

type Step = "search" | "select-dog" | "select-service" | "embed";

export interface DogResult {
  id: string;
  name: string;
  breed: string;
  size: string | null;
}

export interface OwnerResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  dogs: DogResult[];
}

export interface ServiceResult {
  id: string;
  name: string;
  price: number;
  duration: number;
  calComLink: string | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

interface AdminBookingWizardProps {
  initialOwner?: OwnerResult;
  initialDog?: DogResult;
  onClose?: () => void;
  className?: string;
}

export default function AdminBookingWizard({
  initialOwner,
  initialDog,
  onClose,
  className = "bg-white rounded-xl shadow-sm border border-neutral-200 p-6 max-w-2xl mx-auto",
}: AdminBookingWizardProps) {
  const [step, setStep] = useState<Step>(
    initialOwner && initialDog ? "select-service" : "search"
  );

  // Paso 1: Search
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [owners, setOwners] = useState<OwnerResult[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerResult | null>(
    initialOwner || null
  );

  // Paso 2: Dog
  const [selectedDog, setSelectedDog] = useState<DogResult | null>(
    initialDog || null
  );

  // Paso 3: Service
  const [services, setServices] = useState<ServiceResult[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceResult | null>(
    null
  );

  useEffect(() => {
    if (initialOwner && initialDog) {
      loadServices();
    }
  }, [initialOwner, initialDog]);

  useEffect(() => {
    if (!query.trim()) {
      setOwners([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/admin/search-clients?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.owners) {
          setOwners(data.owners);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const loadServices = async () => {
    if (services.length > 0) return;
    setLoadingServices(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (data.services) {
        setServices(data.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSelectOwner = (owner: OwnerResult) => {
    setSelectedOwner(owner);
    setStep("select-dog");
  };

  const handleSelectDog = (dog: DogResult) => {
    setSelectedDog(dog);
    loadServices();
    setStep("select-service");
  };

  const handleSelectService = (service: ServiceResult) => {
    setSelectedService(service);
    setStep("embed");
  };

  let prefillData: CalComPrefill | undefined;
  if (selectedOwner && selectedDog && selectedService) {
    prefillData = {
      name: selectedOwner.name,
      email: selectedOwner.email ?? "",
      attendeePhoneNumber: selectedOwner.phone,
      nombre_perro: selectedDog.name,
      raza_perro: selectedDog.breed,
      dog_size: selectedDog.size ?? "",
      servicio: selectedService.name,
    };
  }

  return (
    <div className={className}>
      {/* Breadcrumbs & Close */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2 text-sm text-neutral-500 overflow-x-auto">
          {(!initialOwner || !initialDog) && (
            <>
              <span className={step === "search" ? "font-semibold text-[var(--primary)]" : ""}>1. Buscar Cliente</span>
              <span>→</span>
              <span className={step === "select-dog" ? "font-semibold text-[var(--primary)]" : ""}>2. Elegir Mascota</span>
              <span>→</span>
            </>
          )}
          <span className={step === "select-service" ? "font-semibold text-[var(--primary)]" : ""}>
            {initialOwner && initialDog ? "1. Elegir Servicio" : "3. Servicio"}
          </span>
          <span>→</span>
          <span className={step === "embed" ? "font-semibold text-[var(--primary)]" : ""}>
            {initialOwner && initialDog ? "2. Agendar" : "4. Agendar"}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-black p-1">
            ✕
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold mb-4">Buscar cliente o perro</h2>
            <input
              type="text"
              placeholder="Ej: Juan Pérez o Firulais..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="mt-4 space-y-2">
              {loadingSearch && <p className="text-neutral-500 text-sm">Buscando...</p>}
              {!loadingSearch && query.trim() && owners.length === 0 && (
                <div className="p-4 bg-neutral-50 rounded-lg text-center border border-neutral-100">
                  <p className="text-neutral-600">No se encontraron clientes.</p>
                  <p className="text-sm mt-1">¿Quieres crear uno nuevo?</p>
                  <Link
                    href="/admin/clientes/nuevo"
                    className="inline-block mt-3 bg-[var(--primary)] text-white px-4 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Crear cliente
                  </Link>
                </div>
              )}
              {!loadingSearch && owners.map((owner) => (
                <button
                  key={owner.id}
                  onClick={() => handleSelectOwner(owner)}
                  className="w-full text-left border border-neutral-200 rounded-xl p-4 hover:border-[var(--primary)] hover:bg-purple-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{owner.name}</p>
                    <p className="text-sm text-neutral-500">{owner.phone}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {owner.dogs.map((dog) => (
                        <span key={dog.id} className="bg-white border border-neutral-200 text-xs px-2 py-1 rounded-full">
                          {dog.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[var(--primary)]">→</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "select-dog" && selectedOwner && (
          <motion.div
            key="select-dog"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {!initialDog && (
              <button onClick={() => setStep("search")} className="text-sm text-neutral-500 hover:text-black mb-4">← Volver</button>
            )}
            <h2 className="text-xl font-semibold mb-4">¡Hola {selectedOwner.name.split(" ")[0]}! ¿Cuál perrito viene hoy?</h2>
            <div className="space-y-3">
              {selectedOwner.dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => handleSelectDog(dog)}
                  className="w-full text-left border border-neutral-200 rounded-xl p-4 hover:border-[var(--primary)] hover:bg-purple-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium block">{dog.name}</span>
                    <span className="text-sm text-neutral-500 block">
                      {dog.breed} {dog.size ? `(${dog.size})` : ""}
                    </span>
                  </div>
                  <span className="text-[var(--primary)]">→</span>
                </button>
              ))}
              {selectedOwner.dogs.length === 0 && (
                <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-center border border-orange-100">
                  <p>Este cliente no tiene perritos registrados.</p>
                  <Link
                    href={`/admin/clientes/${selectedOwner.id}`}
                    className="inline-block mt-3 bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-orange-700 transition-colors"
                  >
                    Agregar perrito
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === "select-service" && selectedDog && (
          <motion.div
            key="select-service"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {!initialDog && (
              <button onClick={() => setStep("select-dog")} className="text-sm text-neutral-500 hover:text-black mb-4">← Volver</button>
            )}
            <h2 className="text-xl font-semibold mb-4">Elige un servicio para {selectedDog.name}</h2>
            {loadingServices ? (
              <p className="text-neutral-500">Cargando servicios...</p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => {
                  const hasLink = !!service.calComLink;
                  return (
                    <button
                      key={service.id}
                      disabled={!hasLink}
                      onClick={() => handleSelectService(service)}
                      className={`w-full text-left border rounded-xl p-4 flex justify-between items-center transition-colors ${
                        hasLink 
                          ? "border-neutral-200 hover:border-[var(--primary)] hover:bg-purple-50"
                          : "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed"
                      }`}
                      title={!hasLink ? "Servicio sin link de Cal.com asignado" : undefined}
                    >
                      <div>
                        <span className="font-medium block">
                          {service.name}
                          {!hasLink && <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">⚠️ Sin link de Cal.com</span>}
                        </span>
                        <span className="text-sm text-neutral-500 block">
                          {formatPrice(service.price)} • {service.duration} min
                        </span>
                      </div>
                      {hasLink && <span className="text-[var(--primary)]">→</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {step === "embed" && selectedService && selectedOwner && selectedDog && prefillData && (
          <motion.div
            key="embed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold">📋 Agendando: {selectedService.name}</h2>
                <p className="text-neutral-500">para <strong>{selectedDog.name}</strong> ({selectedOwner.name})</p>
              </div>
              <button 
                onClick={() => setStep("select-service")} 
                className="border border-neutral-200 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                ← Cambiar
              </button>
            </div>
            
            <div className="w-full bg-white rounded-3xl overflow-hidden border border-neutral-200">
              <CalComEmbed calLink={selectedService.calComLink!} prefill={prefillData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
