"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  PawPrint,
  Scissors,
  Users,
  X,
  Star,
  Mail,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/actions";

interface AdminSidebarProps {
  userName: string;
  pendingReviewsCount?: number;
}

export default function AdminSidebar({ userName, pendingReviewsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, exact: false },
    { href: "/admin/citas", label: "Citas", icon: ClipboardList, exact: false },
    { href: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
    { href: "/admin/perros", label: "Perros", icon: PawPrint, exact: false },
    {
      href: "/admin/servicios",
      label: "Servicios",
      icon: Scissors,
      exact: false,
    },
    {
      href: "/admin/contenido",
      label: "Contenido",
      icon: FileText,
      exact: false,
    },
    {
      href: "/admin/galeria",
      label: "Galería",
      icon: ImageIcon,
      exact: false,
      badge: 0,
    },
    {
      href: "/admin/resenas",
      label: "Reseñas",
      icon: Star,
      exact: false,
      badge: pendingReviewsCount,
    },
    {
      href: "/admin/campanas",
      label: "Campañas",
      icon: Mail,
      exact: false,
      badge: 0,
    },
  ];

  function active(href: string, exact: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const navLinks = (
    <>
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: "var(--ps-lila-light)" }}
      >
        <p
          className="font-semibold text-lg leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ps-lila-deep)",
          }}
        >
          Petit Salón
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--ps-text-mid)" }}
        >
          {userName}
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
          const isActive = active(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                !isActive && "hover:bg-surface",
              )}
              style={
                isActive
                  ? { backgroundColor: "var(--ps-lila)", color: "white" }
                  : { color: "var(--ps-text-mid)" }
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-2 py-4 border-t"
        style={{ borderColor: "var(--ps-lila-light)" }}
      >
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors hover:bg-surface"
            style={{ color: "var(--ps-text-mid)" }}
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r overflow-y-auto"
      style={{
        backgroundColor: "var(--ps-lila-base)",
        borderColor: "var(--ps-lila-light)",
      }}
    >
      {navLinks}
    </aside>
  );
}
