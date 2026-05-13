import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ContenidoClient from "./ContenidoClient";

export default async function ContenidoPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const configs = await prisma.siteConfig.findMany();
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));

  const faqs = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-light mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
          >
            Contenido
          </h1>
          <p style={{ color: "var(--ps-text-mid)" }}>
            Gestiona la información pública de tu landing page.
          </p>
        </div>
      </div>

      <ContenidoClient config={configMap} faqs={faqs} />
    </main>
  );
}
