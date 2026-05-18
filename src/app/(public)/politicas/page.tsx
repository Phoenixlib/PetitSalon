import { ShieldCheck, CalendarRange, Sparkles, HeartPulse, ReceiptText } from "lucide-react";

export const metadata = {
  title: "Políticas de Servicio — Petit Salón",
  description:
    "Conoce las normas y políticas de nuestro salón de peluquería canina. Reserva de citas, cancelaciones, salud de las mascotas y manejo respetuoso en Santiago.",
};

const SECTIONS = [
  {
    id: "citas",
    title: "1. Citas y Cancelaciones",
    icon: CalendarRange,
    bgColor: "rgba(182, 230, 230, 0.2)", // Pastel cyan tint
    iconColor: "var(--primary)",
    items: [
      {
        title: "Tolerancia de Atraso",
        text: "Contamos con una tolerancia máxima de 15 minutos. Pasado este tiempo, la cita podría ser reprogramada para no retrasar el cronograma de otros perritos.",
      },
      {
        title: "Políticas de Cancelación",
        text: "Agradecemos notificar cualquier cambio o cancelación con al menos 24 horas de anticipación. Esto nos permite ofrecer el espacio a otra mascota en lista de espera.",
      },
      {
        title: "Inasistencias Sin Aviso",
        text: "Las inasistencias reiteradas sin aviso previo podrían requerir el pago por adelantado del 50% de la tarifa para futuras reservas.",
      },
    ],
  },
  {
    id: "salud",
    title: "2. Salud y Bienestar",
    icon: HeartPulse,
    bgColor: "rgba(249, 206, 223, 0.25)", // Pastel pink tint
    iconColor: "var(--secondary)",
    items: [
      {
        title: "Vacunas Obligatorias",
        text: "Por la seguridad de todas las mascotas y nuestro personal, es requisito obligatorio contar con la vacuna antirrábica y octuple/séxtuple al día.",
      },
      {
        title: "Condiciones Médicas y Preexistentes",
        text: "Es deber del tutor informarnos si la mascota padece de problemas cardíacos, epilepsia, cirugías recientes, alergias cutáneas, dolores articulares o si está preñada.",
      },
      {
        title: "Parásitos Activos",
        text: "Si durante la evaluación inicial detectamos una presencia severa de pulgas o garrapatas, se aplicará obligatoriamente un baño antiparasitario especial con un costo adicional por seguridad del salón.",
      },
    ],
  },
  {
    id: "seguridad",
    title: "3. Seguridad y Conducta",
    icon: ShieldCheck,
    bgColor: "rgba(254, 244, 204, 0.3)", // Pastel yellow tint
    iconColor: "var(--accent)",
    items: [
      {
        title: "Peluquería Libre de Estrés",
        text: "No utilizamos sedantes de ningún tipo. Priorizamos el manejo respetuoso y en positivo, respetando los tiempos de adaptación y pausas que requiera cada perro.",
      },
      {
        title: "Agresividad o Miedo Extremo",
        text: "Es fundamental que nos indiques si tu perro suele reaccionar con agresividad, miedo o si tiene zonas sensibles al tacto. Esto nos ayuda a adaptar nuestro método de trabajo.",
      },
      {
        title: "Límite de Seguridad",
        text: "Si el nivel de agresividad o estrés pone en riesgo inminente la integridad física de la mascota o del estilista canino, el servicio se suspenderá de inmediato, cobrándose únicamente la proporción del trabajo realizado.",
      },
    ],
  },
  {
    id: "tarifas",
    title: "4. Tarifas y Servicios Especiales",
    icon: ReceiptText,
    bgColor: "rgba(244, 208, 193, 0.25)", // Pastel peach tint
    iconColor: "#d18910",
    items: [
      {
        title: "Tarifas Base y Estado del Manto",
        text: "Los precios publicados corresponden a servicios en mantos con mantenimiento regular y sin nudos severos. El costo final puede variar tras la inspección física inicial.",
      },
      {
        title: "Recargo por Nudos y Deslanado",
        text: "Si el manto presenta nudos compactos que requieran un trabajo de desenredado minucioso o deslanado intensivo, se aplicará un recargo proporcional al tiempo y productos adicionales requeridos.",
      },
      {
        title: "Cortes de Raza Específicos",
        text: "Los cortes de raza estándar o de alta complejidad que exigen técnicas avanzadas de tijera y stripping tienen tarifas diferenciadas que se acuerdan al ingresar.",
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
