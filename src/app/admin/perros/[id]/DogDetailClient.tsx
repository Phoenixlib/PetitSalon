"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DogModal from "@/components/admin/DogModal";
import AttendanceModal from "@/components/admin/AttendanceModal";
import AppointmentModal from "@/components/admin/AppointmentModal";
import AdminBookingModal from "@/components/admin/AdminBookingModal";
import AppointmentDetailModal from "@/components/admin/AppointmentDetailModal";
import { AppointmentWithRelations, AppointmentStatus } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

type ServiceInfo = { id: string; name: string };
type DogWithDetails = {
  id: string;
  name: string;
  breed: string;
  age: string | null;
  weight: string | null;
  notes: string | null;
  photo: string | null;
  ownerId: string;
  owner: { name: string; phone: string; email: string | null };
  attendances: {
    id: string;
    service: string;
    date: Date;
    notes: string | null;
    photos: string[];
  }[];
  appointments: AppointmentWithRelations[];
};

export default function DogDetailClient({
  dog,
  services,
}: {
  dog: DogWithDetails;
  services: ServiceInfo[];
}) {
  const [isDogModalOpen, setIsDogModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  // Lightbox state for attendance photos
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);
  const [activePhotos, setActivePhotos] = useState<string[]>([]);

  const closePreview = useCallback(() => {
    setActivePhotoIdx(null);
    setActivePhotos([]);
  }, []);

  const nextPhoto = useCallback(() => {
    if (activePhotoIdx === null || activePhotos.length === 0) return;
    setActivePhotoIdx((prev) => (prev === null ? 0 : (prev + 1) % activePhotos.length));
  }, [activePhotoIdx, activePhotos]);

  const prevPhoto = useCallback(() => {
    if (activePhotoIdx === null || activePhotos.length === 0) return;
    setActivePhotoIdx((prev) =>
      prev === null ? 0 : (prev - 1 + activePhotos.length) % activePhotos.length
    );
  }, [activePhotoIdx, activePhotos]);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIdx === null) return;
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIdx, closePreview, nextPhoto, prevPhoto]);

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/clientes/${dog.ownerId}`}
          className="text-neutral-500 hover:text-neutral-700"
        >
          ← Volver a {dog.owner.name}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Ficha Mascota: {dog.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dog Info & Owner Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div 
              className={`h-48 bg-neutral-100 flex items-center justify-center text-6xl relative ${dog.photo ? "cursor-pointer hover:opacity-90 transition-opacity group" : ""}`}
              onClick={() => {
                if (dog.photo) {
                  setActivePhotos([dog.photo]);
                  setActivePhotoIdx(0);
                }
              }}
            >
              {dog.photo ? (
                <>
                  <img
                    src={dog.photo}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-opacity shadow-sm">
                      Ver en grande
                    </span>
                  </div>
                </>
              ) : (
                "🐾"
              )}
            </div>

            <div className="p-6 relative">
              <button
                onClick={() => setIsDogModalOpen(true)}
                className="absolute top-4 right-4 bg-white shadow-sm border border-neutral-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Editar
              </button>

              <h2 className="text-2xl font-bold mb-1">{dog.name}</h2>
              <p className="text-neutral-600 mb-6">{dog.breed}</p>

              <dl className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <dt className="text-neutral-500 font-medium">Peso</dt>
                  <dd className="font-medium">{dog.weight || "-"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Edad</dt>
                  <dd className="font-medium">{dog.age || "-"}</dd>
                </div>
              </dl>

              {dog.notes && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Notas Importantes
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-orange-800">{dog.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold mb-4 underline decoration-[var(--primary)] decoration-2 underline-offset-4">
              Contacto del Dueño
            </h3>
            <div className="space-y-4 text-sm">
              <p className="font-bold text-xl text-neutral-800">
                {dog.owner.name}
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${dog.owner.phone}`}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <span className="text-xl">📞</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      Llamar al número
                    </span>
                    <span className="font-bold text-neutral-700 group-hover:text-blue-600 transition-colors">
                      {dog.owner.phone}
                    </span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${dog.owner.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:bg-green-100 transition-all group"
                >
                  <span className="text-xl">💬</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-green-600/60">
                      Enviar mensaje
                    </span>
                    <span className="font-bold text-green-700">WhatsApp</span>
                  </div>
                </a>
              </div>

              {dog.owner.email && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-xl">✉️</span>
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      Correo Electrónico
                    </span>
                    <span className="font-medium text-neutral-600 truncate">
                      {dog.owner.email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: History & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Próximas Citas</h3>
              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Agendar cita
              </button>
            </div>

            {dog.appointments.length === 0 ? (
              <p className="text-neutral-500 text-sm py-2">
                No hay citas programadas.
              </p>
            ) : (
              <div className="space-y-3">
                {dog.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                        {apt.date.toLocaleDateString()} -{" "}
                        {apt.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-blue-800">
                        {apt.service.name}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-200">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History / Attendances */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
              <h3 className="font-bold text-lg">Historial de Atenciones</h3>
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                + Registrar Atención
              </button>
            </div>

            <div className="divide-y divide-neutral-200">
              {dog.attendances.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No hay registros de atención previos.
                </div>
              ) : (
                dog.attendances.map((record) => (
                  <div
                    key={record.id}
                    className="p-6 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded font-medium mb-2">
                          {record.date.toLocaleDateString()}
                        </span>
                        <h4 className="font-semibold text-lg">
                          {record.service}
                        </h4>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-neutral-600 mb-4 whitespace-pre-wrap">
                        {record.notes}
                      </p>
                    )}

                    {record.photos && record.photos.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {record.photos.map((photo, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setActivePhotos(record.photos);
                              setActivePhotoIdx(i);
                            }}
                            className="w-20 h-20 bg-neutral-200 rounded-lg shrink-0 border border-neutral-300 overflow-hidden cursor-pointer hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm"
                          >
                            <img
                              src={photo}
                              alt="Resultado"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDogModalOpen && (
          <DogModal
            dog={dog}
            isOpen={isDogModalOpen}
            onClose={() => setIsDogModalOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAttendanceModalOpen && (
          <AttendanceModal
            dogId={dog.id}
            dogName={dog.name}
            isOpen={isAttendanceModalOpen}
            onClose={() => setIsAttendanceModalOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAppointmentModalOpen && (
          <AdminBookingModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
            initialOwner={{
              id: dog.ownerId,
              name: dog.owner.name,
              phone: dog.owner.phone,
              email: dog.owner.email,
              dogs: [
                {
                  id: dog.id,
                  name: dog.name,
                  breed: dog.breed,
                  age: dog.age,
                  weight: dog.weight,
                },
              ],
            }}
            initialDog={{
              id: dog.id,
              name: dog.name,
              breed: dog.breed,
              age: dog.age,
              weight: dog.weight,
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedAppointment && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Modal for Attendance Photos */}
      <AnimatePresence>
        {activePhotoIdx !== null && activePhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
            onClick={closePreview}
          >
            {/* Botón de Cerrar */}
            <button
              onClick={closePreview}
              className="absolute top-6 right-6 z-[120] p-3.5 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label="Cerrar vista"
            >
              <span className="text-lg font-light block leading-none w-4 h-4 flex items-center justify-center">✕</span>
            </button>

            {/* Flecha Izquierda (Anterior) */}
            {activePhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute left-4 md:left-8 z-[120] p-3.5 md:p-4 text-white/75 hover:text-white bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/5"
                aria-label="Foto anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Flecha Derecha (Siguiente) */}
            {activePhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-4 md:right-8 z-[120] p-3.5 md:p-4 text-white/75 hover:text-white bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/5"
                aria-label="Siguiente foto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Container Principal de la Imagen */}
            <motion.div
              initial={{ scale: 0.97, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePhotos[activePhotoIdx]}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    src={activePhotos[activePhotoIdx]}
                    alt="Atención de peluquería canina"
                    className="max-h-[68vh] max-w-full object-contain pointer-events-none"
                  />
                </AnimatePresence>
              </div>

              {/* Indicador de posición (ej. 1 de 3) */}
              {activePhotos.length > 1 && (
                <div className="mt-5 text-center">
                  <p className="text-white text-xs font-medium tracking-wide bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-block border border-white/5 shadow-md">
                    {activePhotoIdx + 1} de {activePhotos.length}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
