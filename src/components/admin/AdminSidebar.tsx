"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/actions";

interface AdminSidebarProps {
  userName: string;
}

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
] as const;

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = active(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                setOpen(false);
              }}
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
              {label}
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
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r overflow-y-auto"
        style={{
          backgroundColor: "var(--ps-lila-base)",
          borderColor: "var(--ps-lila-light)",
        }}
      >
        {navLinks}
      </aside>

      {/* Mobile: fixed secondary bar (below public header at top-16) */}
      <div
        className="md:hidden fixed top-16 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{
          backgroundColor: "var(--ps-lila-base)",
          borderColor: "var(--ps-lila-light)",
        }}
      >
        <span
          className="font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ps-lila-deep)",
          }}
        >
          Petit Salón
        </span>
        <button
          onClick={() => {
            setOpen(true);
          }}
          className="p-1.5 rounded-md"
          aria-label="Abrir menú"
          style={{ color: "var(--ps-text-mid)" }}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile: drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => {
              setOpen(false);
            }}
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-56 border-r overflow-y-auto"
            style={{
              backgroundColor: "var(--ps-lila-base)",
              borderColor: "var(--ps-lila-light)",
            }}
          >
            <div
              className="flex items-center justify-end px-4 h-14 border-b shrink-0"
              style={{ borderColor: "var(--ps-lila-light)" }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                }}
                className="p-1.5 rounded-md"
                aria-label="Cerrar menú"
                style={{ color: "var(--ps-text-mid)" }}
              >
                <X className="size-5" />
              </button>
            </div>
            {navLinks}
          </aside>
        </>
      )}
    </>
  );
}
