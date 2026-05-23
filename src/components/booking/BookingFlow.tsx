"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalComEmbed, { CalComPrefill } from "./CalComEmbed";
import { Check, Copy, Info, X, ShieldAlert, Clock, CalendarDays, PawPrint } from "lucide-react";

type Step = "lookup" | "dog-select" | "embed";

interface Dog {
  id: string;
  name: string;
  breed: string;
  age?: string | null;
  weight?: string | null;
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
  bankConfig: Record<string, string>;
}

export default function BookingFlow({ calLink, servicio, bankConfig }: BookingFlowProps) {
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
  const [newDog, setNewDog] = useState({ name: "", breed: "", age: "", weight: "" });

  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
      dog_size: "",
      edad: dog.age || "",
      peso: dog.weight || "",
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
      dog_size: "",
      edad: newDog.age,
      peso: newDog.weight,
      servicio: servicio || "",
    });
    setStep("embed");
  };

  const bankDetailsText = `Datos de Transferencia - Petit Salón
Banco: ${bankConfig.bank_name || ""}
Tipo de Cuenta: ${bankConfig.bank_account_type || ""}
Número de Cuenta: ${bankConfig.bank_account_number || ""}
Titular: ${bankConfig.bank_owner_name || ""}
RUT: ${bankConfig.bank_rut || ""}
Correo: ${bankConfig.bank_email || ""}`;

  const handleCopyBankDetails = () => {
    navigator.clipboard.writeText(bankDetailsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappPhone = bankConfig.whatsapp || "";
  const cleanPhone = whatsappPhone.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Acabo de agendar una cita en Petit Salón para mi perrito. He leído y acepto los términos y condiciones, y aquí te adjunto el comprobante del abono de $10.000 CLP de la reserva.🐾`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

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
        {!isSuccess && step === "lookup" && (
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

            <div className="mt-8 pt-6 border-t border-[var(--ps-border)] text-center">
              <p className="text-xs text-[var(--ps-text-mid)] mb-3 font-medium">
                ¿Es la primera visita de tu perrito?
              </p>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full bg-[var(--pastel-peach)]/30 hover:bg-[var(--pastel-peach)]/50 text-[var(--ps-text)] border border-[var(--ps-border)] p-3 rounded-full font-semibold text-sm transition-all hover:shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Primera vez, quiero reservar directamente 🐾
              </button>
            </div>
          </motion.div>
        )}

        {!isSuccess && step === "dog-select" && (
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
                      {dog.breed}
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
                  <input
                    type="text"
                    placeholder="Edad (ej: 3 años)"
                    value={newDog.age}
                    onChange={(e) =>
                      setNewDog({ ...newDog, age: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[var(--ps-border)] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Peso (ej: 8 kg)"
                    value={newDog.weight}
                    onChange={(e) =>
                      setNewDog({ ...newDog, weight: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-[var(--ps-border)] text-sm"
                  />
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

        {!isSuccess && step === "embed" && (
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

        {isSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 mt-8 text-center"
          >
            <div className="size-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <Check className="size-8 stroke-[3]" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              ¡Cita Agendada! 🎉
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Tu hora en <strong>Petit Salón</strong> ha sido reservada con éxito. Para asegurar tu reserva, por favor realiza el abono de <strong>$10.000 CLP</strong> y envía el comprobante de transferencia a continuación.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ps-lila-pale)] rounded-full -mr-8 -mt-8 opacity-40 blur-lg" />
              <h3 className="font-semibold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="inline-block w-1.5 h-3 bg-[var(--ps-lila)] rounded-full" />
                Datos para Transferencia
              </h3>
              
              <div className="space-y-3.5 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Banco:</span>
                  <span className="font-semibold text-slate-800">{bankConfig.bank_name || "Banco por configurar"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Tipo de Cuenta:</span>
                  <span className="font-semibold text-slate-800">{bankConfig.bank_account_type || "Por configurar"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Número de Cuenta:</span>
                  <span className="font-mono font-semibold text-slate-800">{bankConfig.bank_account_number || "Por configurar"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Titular:</span>
                  <span className="font-semibold text-slate-800">{bankConfig.bank_owner_name || "Por configurar"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">RUT:</span>
                  <span className="font-mono font-semibold text-slate-800">{bankConfig.bank_rut || "Por configurar"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Correo:</span>
                  <span className="font-semibold text-slate-800 break-all">{bankConfig.bank_email || "Por configurar"}</span>
                </div>
              </div>

              <button
                onClick={handleCopyBankDetails}
                className="w-full mt-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 p-2.5 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-green-500" /> ¡Datos Copiados!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 text-slate-400" /> Copiar Datos de Transferencia
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowTerms(true)}
              className="w-full mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3 text-left hover:bg-amber-100 transition-colors group"
            >
              <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                <ShieldAlert className="size-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  Información Importante
                  <span className="text-[10px] bg-amber-200/50 px-1.5 py-0.5 rounded text-amber-700 font-medium">Leer</span>
                </h4>
                <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                  Para la mejor experiencia de tu mascota, revisa nuestra política de puntualidad, cancelación y convivencia.
                </p>
              </div>
            </button>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] text-sm cursor-pointer"
              >
                <svg className="size-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.862-9.861.002-2.638-1.023-5.117-2.884-6.979C16.592 1.905 14.12 1.88 11.482 1.88c-5.437 0-9.862 4.416-9.865 9.86-.001 1.762.479 3.483 1.392 5.017L1.93 22.07l5.448-1.428c1.554.848 3.238 1.293 4.962 1.293zM15.97 18.06c-.23.115-.65.23-.97.23-.32 0-.74-.115-1.06-.23-1.16-.48-2.28-1.16-3.26-2.03-.98-.87-1.78-1.92-2.38-3.08-.28-.53-.28-1.05.02-1.39.26-.29.56-.56.84-.84.28-.28.37-.56.24-.87-.13-.31-.56-1.39-.77-1.88-.2-.49-.4-.56-.63-.56-.23 0-.46 0-.69.07-.23.07-.53.22-.76.45-.63.63-.98 1.48-.98 2.38 0 1.27.53 2.5 1.46 3.65 1.48 1.83 3.48 3.16 5.86 3.86.63.18 1.26.27 1.89.27.63 0 1.21-.07 1.71-.24.51-.17.96-.46 1.3-.85.34-.39.53-.87.53-1.39 0-.21-.07-.39-.14-.5-.14-.23-.42-.35-.85-.56z" fillRule="evenodd" />
                </svg>
                Enviar Comprobante por WhatsApp
              </a>
              
              <p className="text-[10px] text-slate-400 mt-2">
                Al enviar el comprobante, aceptas nuestros Términos y Condiciones.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-full font-medium transition-colors text-sm cursor-pointer mt-4"
              >
                Volver al Inicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Términos y Condiciones */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <ShieldAlert className="size-5 text-orange-600" />
                  </span>
                  Términos y Condiciones
                </h3>
                <button 
                  onClick={() => setShowTerms(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="size-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 p-1.5 rounded-md">
                      <Clock className="size-4 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Puntualidad y Espera</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-9">
                    Contamos con un margen de espera de máximo <strong>15 minutos</strong>. Pasado este tiempo, la cita se considerará cancelada para no afectar la agenda de los demás perritos y los tiempos de higiene.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-red-100 p-1.5 rounded-md">
                      <CalendarDays className="size-4 text-red-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Cancelaciones y Abonos</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-9">
                    Para el reembolso del abono de reserva ($10.000), se requiere un aviso de cancelación con al menos <strong>24 horas de anticipación</strong>. Si cancelas con menos tiempo o no asistes, el abono no será reembolsable.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-100 p-1.5 rounded-md">
                      <PawPrint className="size-4 text-orange-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Salud e Higiene</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-9">
                    Por seguridad de todos, tu mascota debe contar con sus <strong>vacunas al día</strong> y haber realizado su tratamiento antiparasitario (interno y externo). No podemos recibir mascotas con signos evidentes de enfermedades contagiosas o parásitos activos.
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-100 p-1.5 rounded-md">
                      <ShieldAlert className="size-4 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-800">Comportamiento y Seguridad</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed ml-9">
                    Es fundamental <strong>notificar previamente</strong> si tu mascota es reactiva, miedosa o presenta tendencia a morder. Esto nos permite tomar medidas de seguridad adicionales para proteger tanto al perrito como a nuestro equipo.
                  </p>
                </section>

                <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed text-center italic">
                    "En Petit Salón nuestra prioridad es el bienestar y la felicidad de tu mascota. Estos términos nos ayudan a mantener un entorno seguro y organizado para todos."
                  </p>
                </section>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setShowTerms(false)}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Entendido, cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

