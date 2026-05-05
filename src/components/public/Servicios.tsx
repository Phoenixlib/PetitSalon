"use client";

import { motion } from "framer-motion";
import { Scissors, Droplets } from "lucide-react";
import { useState } from "react";

const categorias = [
  {
    id: "peluqueria",
    titulo: "Peluquería Completa",
    icono: <Scissors className="w-6 h-6" />,
    notaInclusion: "Este servicio incluye:",
    inclusiones: [
      "Baño con cosmética hipoalergénica de alta gama",
      "Secado y peinado profesional",
      "CORTE DE PELO DE TU PREFERENCIA (A evaluar pelaje)",
      "Corte de uñas",
      "Corte en áreas genitales y patitas",
      "Perfume de larga duración",
    ],
    notaExtra: "*La limpieza de oídos no va incluida en este servicio, puedes agregarla como un adicional y tiene un valor de 1.000clp*",
    tallas: [
      {
        nombre: "Talla S",
        descripcion: "Ideal para perritos desde 1 a 7kg.",
        nota: "Los valores publicados son \"desde\", es decir, que pueden variar sutilmente dependiendo de la complejidad del corte de su perrito.",
        tiempo: "02hr :00min",
        precio: "$30.000",
      },
      {
        nombre: "Talla M",
        descripcion: "Ideal para perritos de 8kg a 13kg.",
        nota: "Los valores publicados son \"desde\", es decir, que pueden variar sutilmente dependiendo de la complejidad del corte de su perrito.",
        tiempo: "02hr :30min",
        precio: "$32.000",
      },
      {
        nombre: "Talla L",
        descripcion: "Ideal para perritos de 13kg a 18kg.",
        nota: "Los valores publicados son \"desde\", es decir, que pueden variar sutilmente dependiendo de la complejidad del corte de su perrito.",
        tiempo: "02hr :30min",
        precio: "$38.000",
      }
    ]
  },
  {
    id: "bano",
    titulo: "Servicios de Baño",
    icono: <Droplets className="w-6 h-6" />,
    notaInclusion: "Los servicios de baño incluyen:",
    inclusiones: [
      "Baño con cosmética de las mejores gamas",
      "Secado y peinado profesional",
      "Limpieza de oídos",
      "Corte de uñas",
      "Despeje en áreas genitales (si aplica)",
      "Despeje de ojitos",
      "Perfume",
      "Deslanado (si aplica)"
    ],
    tallas: [
      {
        nombre: "Baño talla XS",
        descripcion: "Ideal para perritos de raza pequeña (1kg a 7kg).",
        nota: "(Bulldog Frances, Fox T. chileno, Mestizo pelo corto o largo de poca densidad, Yorkshire, maltés)",
        tiempo: "01hr :15min",
        precio: "$20.000",
      },
      {
        nombre: "Baño talla S",
        descripcion: "Ideal para perritos de 9kg a 14kg, pelo corto o largo.",
        nota: "(Pug Carlino, Bull Terrier, Poodle mediano, Westy, Bulldog Inglés, otros)",
        tiempo: "01hr :30min",
        precio: "$23.000",
      },
      {
        nombre: "Baño talla M",
        descripcion: "Ideal para perritos de 15kg a 23kg, pelo corto o largo.",
        nota: "(Labrador, Golden, Poodle grande pelo largo, Bulldog inglés, otros)",
        tiempo: "02hr :00min",
        precio: "$30.000",
      }
    ]
  }
];

export default function Servicios() {
  const [categoriaAbierta, setCategoriaAbierta] = useState<string>("peluqueria");

  return (
    <section id="servicios" className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 relative z-10">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--ps-gold)" }}>
            Nuestra Especialidad
          </span>
          <h2 className="text-4xl md:text-5xl font-light mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}>
            Servicios
          </h2>
          <p className="text-lg" style={{ color: "var(--ps-text-mid)" }}>Haz clic en una categoría para ver sus detalles:</p>
        </div>

        <div className="space-y-6">
          {categorias.map((cat) => {
            const estaAbierta = categoriaAbierta === cat.id;

            return (
              <div key={cat.id} className="rounded-3xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--ps-lila-pale)" }}>
                <button
                  onClick={() => setCategoriaAbierta(estaAbierta ? "" : cat.id)}
                  className="w-full flex items-center justify-between p-6 transition-colors duration-300"
                  style={{
                    background: estaAbierta ? "linear-gradient(135deg, var(--ps-gold-light) 0%, var(--ps-gold) 100%)" : "white",
                    color: estaAbierta ? "white" : "var(--ps-text)"
                  }}
                >
                  <div className="flex items-center gap-4 text-xl md:text-2xl font-bold">
                    {cat.icono}
                    <span>{cat.titulo}</span>
                  </div>
                  <div className={`transform transition-transform duration-300 ${estaAbierta ? "rotate-180" : ""}`}>
                    ▼
                  </div>
                </button>

                <motion.div
                  initial={estaAbierta ? "open" : "collapsed"}
                  animate={estaAbierta ? "open" : "collapsed"}
                  variants={{
                    open: { height: "auto", opacity: 1 },
                    collapsed: { height: 0, opacity: 0 }
                  }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden bg-white"
                >
                  <div className="p-6 md:p-8">
                    <div className="mb-10 text-base" style={{ color: "var(--ps-text-mid)" }}>
                      <p className="mb-2 font-medium" style={{ color: "var(--ps-text)" }}>{cat.notaInclusion}</p>
                      <ul className="space-y-1 mb-4 ms-2">
                        {cat.inclusiones.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: "var(--ps-lila-deep)" }}>+</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                      {cat.notaExtra && (
                        <p className="text-sm italic" style={{ color: "var(--ps-lila-deep)" }}>{cat.notaExtra}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cat.tallas.map((talla, i) => (
                        <div key={i} className="p-6 rounded-2xl border bg-white flex flex-col h-full" style={{ borderColor: "var(--ps-lila-pale)" }}>
                          <h4 className="text-xl font-bold mb-2" style={{ color: "var(--ps-text)" }}>{talla.nombre}</h4>
                          <p className="text-sm font-medium mb-4" style={{ color: "var(--ps-text-mid)" }}>{talla.descripcion}</p>
                          
                          <p className="text-xs mb-8 flex-grow opacity-80" style={{ color: "var(--ps-text-mid)" }}>
                            {talla.nota}
                          </p>

                          <div className="mt-auto pt-4 border-t flex flex-col gap-2" style={{ borderColor: "var(--ps-lila-pale)" }}>
                            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ps-text)" }}>
                              <span aria-hidden="true" className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-[10px] leading-4">⏱</span> {talla.tiempo}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <span style={{ color: "var(--ps-text-mid)" }}>Desde</span>
                              <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-600">
                                {talla.precio}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
