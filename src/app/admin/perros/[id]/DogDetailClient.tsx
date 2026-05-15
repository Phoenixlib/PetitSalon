"use client";

import { useState } from "react";
import Link from "next/link";
import DogModal from "@/components/admin/DogModal";
import AttendanceModal from "@/components/admin/AttendanceModal";
import AppointmentModal from "@/components/admin/AppointmentModal";
import { DogSize } from "@prisma/client";
import { AnimatePresence } from "framer-motion";

type ServiceInfo = { id: string; name: string };
type DogWithDetails = {
  id: string;
  name: string;
  breed: string;
  size: DogSize | null;
  age: string | null;
  weight: string | null;
  notes: string | null;
  photo: string | null;
  ownerId: string;
  owner: { name: string; phone: string; email: string | null };
  attendances: { id: string; service: string; date: Date; notes: string | null; photos: string[] }[];
  appointments: { id: string; service: ServiceInfo; date: Date; status: string }[];
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

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href={`/admin/clientes/${dog.ownerId}`} className="text-neutral-500 hover:text-neutral-700">
          ← Volver a {dog.owner.name}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Ficha Clínica: {dog.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Dog Info & Owner Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="h-48 bg-neutral-100 flex items-center justify-center text-6xl">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
              ) : "🐾"}
            </div>
            
            <div className="p-6 relative">
              <button onClick={() => setIsDogModalOpen(true)} className="absolute top-4 right-4 bg-white shadow-sm border border-neutral-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                Editar
              </button>
              
              <h2 className="text-2xl font-bold mb-1">{dog.name}</h2>
              <p className="text-neutral-600 mb-6">{dog.breed}</p>
              
              <dl className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <dt className="text-neutral-500 font-medium">Tamaño</dt>
                  <dd className="font-medium">{dog.size || "-"}</dd>
                </div>
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
                  <h3 className="font-semibold text-orange-900 mb-2">Notas Importantes</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-sm text-orange-800">{dog.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold mb-4">Contacto del Dueño</h3>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-lg">{dog.owner.name}</p>
              <p className="flex items-center gap-2">📞 {dog.owner.phone}</p>
              {dog.owner.email && <p className="flex items-center gap-2">✉️ {dog.owner.email}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: History & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Próximas Citas</h3>
              <button onClick={() => setIsAppointmentModalOpen(true)} className="text-blue-600 text-sm font-medium hover:underline">Agendar cita</button>
            </div>
            
            {dog.appointments.length === 0 ? (
              <p className="text-neutral-500 text-sm py-2">No hay citas programadas.</p>
            ) : (
              <div className="space-y-3">
                {dog.appointments.map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <p className="font-semibold text-blue-900">{apt.date.toLocaleDateString()} - {apt.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-sm text-blue-800">{apt.service.name}</p>
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
              <button onClick={() => setIsAttendanceModalOpen(true)} className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                + Registrar Atención
              </button>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {dog.attendances.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No hay registros de atención previos.
                </div>
              ) : (
                dog.attendances.map(record => (
                  <div key={record.id} className="p-6 hover:bg-neutral-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded font-medium mb-2">
                          {record.date.toLocaleDateString()}
                        </span>
                        <h4 className="font-semibold text-lg">{record.service}</h4>
                      </div>
                    </div>
                    
                    {record.notes && (
                      <p className="text-sm text-neutral-600 mb-4 whitespace-pre-wrap">{record.notes}</p>
                    )}
                    
                    {record.photos && record.photos.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {record.photos.map((photo, i) => (
                          <div key={i} className="w-20 h-20 bg-neutral-200 rounded-lg shrink-0 border border-neutral-300 overflow-hidden">
                            <img src={photo} alt="Resultado" className="w-full h-full object-cover" />
                          </div>
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
        {isDogModalOpen && <DogModal dog={dog} isOpen={isDogModalOpen} onClose={() => setIsDogModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isAttendanceModalOpen && <AttendanceModal dogId={dog.id} dogName={dog.name} isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isAppointmentModalOpen && <AppointmentModal dogId={dog.id} dogName={dog.name} services={services} isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
