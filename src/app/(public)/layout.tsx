import HeaderWithAuth from "@/components/public/HeaderWithAuth";
import Footer from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappConfig = await prisma.siteConfig.findUnique({
    where: { key: "whatsapp" },
  });
  const whatsapp = whatsappConfig?.value || "56937541863";

  return (
    <>
      <HeaderWithAuth whatsapp={whatsapp} />
      <main className="flex-1">{children}</main>
      <Footer whatsapp={whatsapp} />
    </>
  );
}
