"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalComEmbedProps {
  calLink: string;
}

export default function CalComEmbed({ calLink }: CalComEmbedProps) {
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
    })();
  }, []);

  return (
    <Cal
      namespace="petitsalon"
      calLink={calLink}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "600px",
        overflow: "scroll",
      }}
      config={{ layout: "month_view" }}
    />
  );
}
