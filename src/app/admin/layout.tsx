import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import HeaderWithAuth from "@/components/public/HeaderWithAuth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const whatsappConfig = await prisma.siteConfig.findUnique({
    where: { key: "whatsapp" },
  });
  const whatsapp = whatsappConfig?.value || "56937541863";

  // Sin sesión → mostrar solo el header público + la página de login
  if (!session?.user) {
    return (
      <>
        <HeaderWithAuth whatsapp={whatsapp} />
        <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      </>
    );
  }

  const userName = session.user.name ?? session.user.email ?? "Admin";

  const pendingReviewsCount = await prisma.review.count({
    where: { status: "PENDING", submittedAt: { not: null } },
  });

  return (
    <>
      <HeaderWithAuth whatsapp={whatsapp} />
      <div className="flex min-h-screen pt-16">
        <AdminSidebar userName={userName} pendingReviewsCount={pendingReviewsCount} />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
