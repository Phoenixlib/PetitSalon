import AdminBookingWizard from "@/components/admin/AdminBookingWizard";

export default function NuevaCitaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Cita</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Busca al cliente, elige el perro y el servicio para agendar en Cal.com.
        </p>
      </div>
      <AdminBookingWizard />
    </div>
  );
}
