import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import HeaderWithAuth from "@/components/public/HeaderWithAuth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Sin sesión → mostrar solo el header público + la página de login
  if (!session?.user) {
    return (
      <>
        <HeaderWithAuth />
        <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      </>
    );
  }

  const userName = session.user.name ?? session.user.email ?? "Admin";

  return (
    <>
      <HeaderWithAuth />
      <div className="flex min-h-screen pt-16">
        <AdminSidebar userName={userName} />
        <main className="flex-1 min-w-0">
          {/* Espaciador para la top bar fija del sidebar en móvil */}
          <div className="h-14 md:hidden" />
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
