"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  ChevronRight,
  Images,
  LogOut,
  Menu,
  PackageOpen,
  Settings,
  Tags,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo, BrandLogoSide } from "@/components/brand-logo";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

const navigation = [
  { label: "Productos", icon: PackageOpen, href: "/dashboard/productos" },
  { label: "Categorías", icon: Boxes, href: "/dashboard/categorias" },
  { label: "Galería", icon: Images, href: "/dashboard/galeria" },
  {
    label: "Cat. galería",
    icon: Tags,
    href: "/dashboard/galeria-categorias",
  },
  { label: "Contacto", icon: Settings, href: "/dashboard/contacto" },
];

/**
 * Full navigation so the proxy re-checks the session cookie; a client
 * navigation can reuse a cached "/login -> /dashboard" redirect.
 */
function goToLogin() {
  window.location.replace("/login");
}

function SidebarContent({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      goToLogin();
    }
  };

  return (
    <div className="flex h-full flex-col font-[family-name:var(--font-nunito)]">
      <div className="flex justify-center px-6 pb-8 pt-6">
        <BrandLogoSide />
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        <p className="mb-3 px-3 font-[family-name:var(--font-nunito)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Menú principal
        </p>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={close}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active
                  ? "bg-white text-[#3A2218] shadow-[0_8px_22px_rgba(0,0,0,0.12)]"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon
                className={`size-[18px] ${active ? "text-[#C62A1E]" : ""}`}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span className="font-semibold">{item.label}</span>
              {active && (
                <ChevronRight className="ml-auto size-4 text-[#C62A1E] opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#C62A1E] font-[family-name:var(--font-display)] text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user?.name ?? "Administrador"}
            </p>
            <p className="truncate text-[10px] text-white/40">
              {user?.email ?? "Sesión activa"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      <Link
        href="/"
        className="mx-6 mb-6 flex items-center gap-3 text-xs text-white/35 transition hover:text-[#E9A83B]"
      >
        <Settings className="size-4" />
        Ver menú público
      </Link>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (isError || !user)) goToLogin();
  }, [isError, isLoading, user]);

  if (isLoading || isError || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#FAF3E6]">
        <div className="flex items-center gap-3 font-[family-name:var(--font-nunito)] text-sm font-semibold text-[#7A6254]">
          <span className="size-5 animate-spin rounded-full border-2 border-[#C62A1E]/20 border-t-[#C62A1E]" />
          Preparando tu espacio...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E6] font-[family-name:var(--font-nunito)] text-[#3A2218]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] bg-[#2B170E] lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#3A2218]/8 bg-[#FAF3E6]/90 px-5 backdrop-blur-xl lg:hidden">
        <BrandLogo compact />
        <button
          onClick={() => setMobileOpen(true)}
          className="grid size-10 cursor-pointer place-items-center rounded-xl border border-[#3A2218]/10 bg-white text-[#3A2218]"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-[#2B170E]/45 backdrop-blur-sm lg:hidden"
              aria-label="Cerrar menú"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#2B170E] lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-5 grid size-9 cursor-pointer place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
              <SidebarContent close={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:ml-[244px]">{children}</main>
    </div>
  );
}
