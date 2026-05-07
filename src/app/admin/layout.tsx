import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Sin sesión → el middleware ya redirige a /admin/login.
  // Aquí renderizamos children directamente para que la página de login
  // no quede envuelta por el layout del panel.
  if (!session?.user) {
    return <>{children}</>;
  }

  const userName = session.user.name ?? session.user.email ?? "Admin";

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={userName} />

      <main className="flex-1">
        {/* Espaciador para la top bar fija en móvil */}
        <div className="h-14 md:hidden" />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
