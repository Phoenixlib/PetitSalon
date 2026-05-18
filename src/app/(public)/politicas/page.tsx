import { ShieldCheck, CalendarRange, Sparkles, HeartPulse, ReceiptText } from "lucide-react";

export const metadata = {
  title: "Políticas de Servicio — Petit Salón",
  description:
    "Conoce las normas y políticas de nuestro salón de peluquería canina. Reserva de citas, cancelaciones, salud de las mascotas y manejo respetuoso en Santiago.",
};

const SECTIONS = [
  {
    id: "citas",
    title: "1. Reservas y Citas",
    icon: CalendarRange,
    bgColor: "rgba(182, 230, 230, 0.2)", // Pastel cyan tint
    iconColor: "var(--primary)",
    items: [
      {
        title: "Agendamiento Previo",
        text: "Las citas deben agendarse previamente.",
      },
      {
        title: "Abono de Reserva",
        text: "Para agendar una hora, el cliente deberá realizar un abono de $10.000 CLP por mascota.",
      },
      {
        title: "Cancelación o Reprogramación",
        text: "En caso de cancelar o reprogramar el servicio con menos de 24 horas de anticipación a la hora agendada, o no asistir al servicio, el abono no será reembolsado.",
      },
      {
        title: "Tolerancia de Atraso",
        text: "El cliente que avise que va atrasado a su cita, se le dará un tiempo máximo de espera de 15 minutos. Pasado este tiempo, podría perder su hora de atención y el abono.",
      },
      {
        title: "Comportamiento del Perro",
        text: "El comportamiento agresivo del perro debe informarse de antemano. De no poderse realizar el servicio por comportamiento violento, el abono no será reembolsado. Es deber del tutor de la mascota conocer el comportamiento de la misma.",
      },
      {
        title: "Servicios Parciales",
        text: "Si se logra realizar parcialmente el servicio de peluquería, pero producto de agresividad no se puede completar, se deberá pagar de igual forma el total del servicio de peluquería.",
      },
      {
        title: "Presencia Durante el Servicio",
        text: "El cliente debe esperar a que el servicio de peluquería haya finalizado para retirar a su mascota. No se puede acompañar durante el proceso de peluquería.",
      },
      {
        title: "Estacionamiento Exclusivo",
        text: "Contamos con un estacionamiento gratuito, exclusivo para dejar y retirar a la mascota.",
      },
      {
        title: "Permanencia y Recargos",
        text: "Una vez finalizado el servicio y notificado el tutor, se otorgarán 30 minutos de permanencia sin costo. Pasado ese tiempo, se aplicará un recargo de $2.000 CLP, más $3.000 CLP por cada 20 minutos adicionales.",
      },
      {
        title: "Pago de Saldo",
        text: "El cliente deberá cancelar el restante del servicio al momento de retirar a su mascota o antes.",
      },
    ],
  },
  {
    id: "salud",
    title: "2. Salud y Responsabilidad",
    icon: HeartPulse,
    bgColor: "rgba(249, 206, 223, 0.25)", // Pastel pink tint
    iconColor: "var(--secondary)",
    items: [
      {
        title: "Estado de Salud Adecuado",
        text: "La mascota debe estar en condiciones adecuadas de salud: sin síntomas de alguna enfermedad que pueda ser viral, sin heridas abiertas o supurando, sin ácaros, garrapatas o enfermedades de piel que puedan ser contagiosas.",
      },
      {
        title: "Parásitos Activos",
        text: "En caso de detectarse pulgas o garrapatas durante el servicio, PetitSalon podrá aplicar un cobro adicional por sanitización e higiene del espacio.",
      },
      {
        title: "Deber de Informar",
        text: "Es deber del tutor informar sobre enfermedades, patologías, alergias o sensibilidades de cualquier tipo.",
      },
      {
        title: "Condiciones Preexistentes",
        text: "PetitSalon no se hace responsable por condiciones médicas preexistentes de la mascota.",
      },
      {
        title: "Emergencias Veterinarias",
        text: "En caso de emergencia, el cliente autoriza el contacto con un servicio veterinario.",
      },
      {
        title: "Drenaje de Glándulas",
        text: "En PetitSalon no realizamos drenaje de glándulas anales.",
      },
      {
        title: "Alimentación",
        text: "PetitSalon no proporcionará ningún tipo de snack a la mascota sin la previa autorización expresa del tutor.",
      },
    ],
  },
  {
    id: "riesgos",
    title: "3. Riesgos Asociados",
    icon: ShieldCheck,
    bgColor: "rgba(254, 244, 204, 0.3)", // Pastel yellow tint
    iconColor: "var(--accent)",
    items: [
      {
        title: "Compromiso de Cuidado",
        text: "PetitSalon se compromete a disminuir al máximo posible cualquier tipo de accidente. Sin embargo, al trabajar con seres vivos, tijeras y otros objetos punzo-cortantes, nos enfrentamos a situaciones de riesgo inherentes al manejo de mascotas.",
      },
      {
        title: "Riesgos Probables",
        text: "Sangrado de uñas, corte por máquina y/o tijeras (más probable en mantos con nudos), lastimado de verrugas por cepillado o corte con cuchilla, e irritación de la piel provocada por motas/nudos.",
      },
      {
        title: "Riesgos Poco Probables",
        text: "Irritación por alergia, rozaduras con cuchillas, irritación de oídos por depilación, término del ciclo vital por causas preexistentes o ajenas al servicio prestado, alopecia, irritación ocular por shampoo, caídas de la mesa de trabajo u otitis.",
      },
      {
        title: "Cobertura de PetitSalon",
        text: "En caso de materializarse cualquiera de las situaciones de riesgo que sean atribuibles al servicio, PetitSalon cuenta con profesionales externos que podrán realizar la evaluación y tomar las medidas necesarias. Esto no tendrá costo para el cliente, siempre que no sea una condición preexistente al servicio, no declarada, o producto de fuerza mayor.",
      },
    ],
  },
  {
    id: "servicios",
    title: "4. De Nuestros Servicios",
    icon: Sparkles,
    bgColor: "rgba(244, 208, 193, 0.25)", // Pastel peach tint
    iconColor: "#d18910",
    items: [
      {
        title: "Peluquería Completa",
        text: "Incluye baño con cosmética hipoalergénica de alta calidad, secado y brushing profesional, despeje en áreas genitales y almohadillas, corte de pelo de su preferencia, corte de uñas, perfume de larga duración y accesorio de regalo.",
      },
      {
        title: "Baño Estético",
        text: "Incluye baño con cosmética hipoalergénica de alta calidad, secado profesional, despeje en áreas genitales y almohadillas (si aplica), deslanado (si aplica), corte de uñas, limpieza de oídos, perfume de larga duración y accesorio de regalo.",
      },
      {
        title: "Duración de los Servicios",
        text: "El tiempo varía según el servicio elegido, el tipo de corte y el comportamiento del perrito. El tiempo promedio de un servicio completo es de 2 horas.",
      },
      {
        title: "Fotografías de Referencia",
        text: "Las fotografías de referencia son únicamente orientativas. El resultado final puede variar según el tipo de pelaje, estado del manto y comportamiento de la mascota.",
      },
      {
        title: "Uso de Imagen",
        text: "El cliente autoriza el uso de fotografías o videos de su mascota con fines promocionales en redes sociales y sitio web, salvo que indique lo contrario previamente.",
      },
      {
        title: "Seguridad y Uso de Bozal",
        text: "En caso de que el perrito muerda durante el proceso de peluquería, se usará un bozal que deja libre el área respiratoria, velando por su seguridad y la nuestra.",
      },
      {
        title: "Expectativas de Resultado",
        text: "No se hacen devoluciones en caso de que la peluquería no cumpla con tus expectativas. Haremos todo lo posible para lograr el corte deseado, pero es un trabajo artesanal, no exacto, influenciado por múltiples factores.",
      },
    ],
  },
  {
    id: "cambios",
    title: "5. Cambios en Políticas",
    icon: ReceiptText,
    bgColor: "rgba(223, 206, 249, 0.25)", // Pastel purple tint
    iconColor: "#8b5cf6",
    items: [
      {
        title: "Modificación de Términos",
        text: "PetitSalon se reserva el derecho a modificar y actualizar los presentes Términos y Condiciones, adaptándolos a cualquier novedad legislativa o jurisprudencial, así como de modificar servicios y precios según las necesidades del mercado.",
      },
    ],
  },
];

export default function PoliticasPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Hero Header */}
      <section
        className="py-20 px-6 text-center border-b border-[var(--pastel-peach)]/40 relative overflow-hidden"
        style={{ backgroundColor: "var(--ps-lila-pale)" }}
      >
        {/* Soft Background Blobs */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--pastel-cyan)]/20 rounded-full blur-2xl -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--pastel-pink)]/20 rounded-full blur-3xl translate-x-16 translate-y-16" />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-white/80 text-[var(--ps-text-mid)] shadow-xs border border-[var(--pastel-peach)]/30">
            <Sparkles className="w-3 h-3 text-[var(--ps-gold)]" /> Compromiso Petit Salón
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
          >
            Políticas de Servicio
          </h1>
          <p
            className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--ps-text-mid)" }}
          >
            Para garantizar una experiencia segura, respetuosa y feliz para tu perrito, te invitamos a revisar los lineamientos que rigen nuestros servicios.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[var(--pastel-peach)]/50 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ps-text)] mb-4 pb-2 border-b border-[var(--pastel-peach)]/30">
                Índice de Políticas
              </h3>
              <nav className="flex flex-col gap-2">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all hover:bg-[var(--ps-lila-pale)] text-[var(--ps-text-mid)] hover:text-[var(--ps-text)] group"
                  >
                    <div
                      className="p-1.5 rounded-xl transition-colors"
                      style={{ backgroundColor: sec.bgColor }}
                    >
                      <sec.icon className="w-4 h-4" style={{ color: sec.iconColor }} />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {sec.title.substring(3)}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Note Card */}
            <div className="bg-[var(--pastel-peach)]/10 rounded-3xl p-6 border border-[var(--pastel-peach)]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--pastel-yellow)]/20 rounded-full blur-xl translate-x-4 -translate-y-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ps-gold-dark)] mb-2 flex items-center gap-1.5">
                💡 Nota para Clientes
              </h4>
              <p className="text-xs leading-relaxed text-[var(--ps-text-mid)]">
                Estas políticas han sido diseñadas pensando 100% en la seguridad, salud e integridad de los perritos. Al reservar tu cita en nuestro salón, aceptas estas condiciones generales.
              </p>
            </div>
          </aside>

          {/* Policy Sections */}
          <main className="lg:col-span-8 space-y-12">
            {SECTIONS.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 bg-white rounded-4xl p-8 border border-[var(--pastel-peach)]/45 shadow-xs transition-all hover:shadow-md"
              >
                {/* Section Title */}
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[var(--pastel-peach)]/20">
                  <div
                    className="p-3.5 rounded-2xl"
                    style={{ backgroundColor: sec.bgColor }}
                  >
                    <sec.icon className="w-7 h-7" style={{ color: sec.iconColor }} />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-semibold"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {sec.title}
                    </h2>
                    <p className="text-xs text-[var(--ps-text-mid)] mt-0.5">
                      Petit Salón • Normativa General
                    </p>
                  </div>
                </div>

                {/* Sub items grid */}
                <div className="grid gap-6">
                  {sec.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="group p-5 rounded-3xl transition-all hover:bg-[var(--ps-lila-pale)]/50 border border-transparent hover:border-[var(--pastel-peach)]/25"
                    >
                      <h3 className="font-semibold text-base mb-2 text-[var(--ps-text)] flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: sec.iconColor }}
                        />
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--ps-text-mid)] pl-3.5">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>

        </div>
      </div>
    </div>
  );
}
