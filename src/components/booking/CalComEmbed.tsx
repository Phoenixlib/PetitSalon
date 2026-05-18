"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export interface CalComPrefill {
  name?: string;
  email?: string;
  attendeePhoneNumber?: string;
  nombre_perro?: string;
  raza_perro?: string;
  dog_size?: string;
  edad?: string;
  peso?: string;
  servicio?: string;
}

interface CalComEmbedProps {
  calLink: string;
  prefill?: CalComPrefill;
  onSuccess?: () => void;
}

export default function CalComEmbed({ calLink, prefill, onSuccess }: CalComEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "petitsalon" });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#c4714e",
            "cal-brand-emphasis": "#a85c3a",
            "cal-brand-text": "#ffffff",
            "cal-border-default": "#e8ddd5",
          },
          dark: {
            "cal-brand": "#c4714e",
            "cal-brand-emphasis": "#a85c3a",
            "cal-brand-text": "#ffffff",
            "cal-border-default": "#4a3728",
          },
        },
      });

      if (onSuccess) {
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            onSuccess();
          },
        });
      }
    })();
  }, [onSuccess]);

  // Construimos la URL con parámetros nativos si existen
  let finalCalLink = calLink;
  if (prefill) {
    const params = new URLSearchParams();
    if (prefill.name) params.append("name", prefill.name);
    if (prefill.email) params.append("email", prefill.email);
    if (prefill.attendeePhoneNumber)
      params.append("attendeePhoneNumber", prefill.attendeePhoneNumber);

    const queryString = params.toString();
    if (queryString) {
      finalCalLink = `${calLink}?${queryString}`;
    }
  }

  // Construimos la configuración para campos personalizados
  const calConfig: Record<string, string> = {
    layout: "month_view",
  };

  if (prefill) {
    if (prefill.nombre_perro) calConfig["nombre_perro"] = prefill.nombre_perro;
    if (prefill.raza_perro) calConfig["raza_perro"] = prefill.raza_perro;
    if (prefill.dog_size) calConfig["dog_size"] = prefill.dog_size;
    if (prefill.edad) calConfig["edad"] = prefill.edad;
    if (prefill.peso) calConfig["peso"] = prefill.peso;
    if (prefill.servicio) calConfig["servicio"] = prefill.servicio;
  }

  return (
    <div className="w-full h-full min-h-[850px] md:min-h-[650px] overflow-y-auto">
      <Cal
        namespace="petitsalon"
        calLink={finalCalLink}
        style={{ width: "100%", height: "100%" }}
        config={calConfig}
      />
    </div>
  );
}
