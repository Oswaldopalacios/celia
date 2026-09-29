"use client";

import {
  ForkKnife,
  Images,
  MapPin,
  SignIn,
  List,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { publicNavLinks } from "@/components/public/nav-items";
import {
  PapelPicadoBanner,
  SectionMark,
} from "@/components/public/celia-marks";

const icons = {
  "/": ForkKnife,
  "/galeria": Images,
  "/ubicacion": MapPin,
} as const;

const easeOut = [0.22, 1, 0.36, 1] as const;
const easeIn = [0.4, 0, 1, 1] as const;

const panel = {
  hidden: { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: easeIn },
  },
};

const list = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: easeOut },
  },
};

function linkHint(href: (typeof publicNavLinks)[number]["href"]) {
  if (href === "/") return "Carta del día";
  if (href === "/galeria") return "Ambiente, eventos y sabores";
  return "Cómo llegar";
}

export function PublicMenuButton({ light = true }: { light?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const overlay =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <div className="pointer-events-auto fixed inset-0 z-[200] mx-auto max-w-[430px] lg:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-[#1F0F08]/55 backdrop-blur-[6px]"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navegación"
              variants={panel}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-x-3 top-3 overflow-hidden rounded-[28px] bg-[#FAF3E6] shadow-[0_28px_70px_rgba(31,15,8,0.35)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(198,42,30,0.14),transparent_70%)]"
              />
              <PapelPicadoBanner className="relative text-[#3A2218]/25" />

              <div className="relative px-5 pb-6 pt-3">
                <div className="mb-7 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-[1.75rem] font-semibold leading-none text-[#3A2218]">
                      Doña Celia
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[#C62A1E]/80">
                      <SectionMark className="h-3 w-7" />
                      <span className="font-[family-name:var(--font-script)] text-[15px] leading-none text-[#2F6B3A]">
                        Desde 1989
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3A2218]/[0.07] text-[#3A2218] transition-colors hover:bg-[#3A2218]/12"
                    aria-label="Cerrar"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                <motion.nav
                  aria-label="Principal"
                  variants={list}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-1.5"
                >
                  {publicNavLinks.map((link) => {
                    const Icon = icons[link.href];
                    const active = link.match(pathname);

                    return (
                      <motion.div key={link.href} variants={item}>
                        <Link
                          href={link.href}
                          className={`group flex items-center gap-3.5 rounded-2xl px-3 py-3.5 transition-colors ${
                            active
                              ? "bg-[#3A2218] text-white"
                              : "text-[#3A2218] hover:bg-white/70"
                          }`}
                        >
                          <span
                            className={`grid size-11 place-items-center rounded-full transition-colors ${
                              active
                                ? "bg-[#C62A1E] text-white"
                                : "bg-white text-[#3A2218]/75 group-hover:text-[#C62A1E]"
                            }`}
                          >
                            <Icon
                              size={20}
                              weight={active ? "fill" : "regular"}
                            />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span
                              className={`font-[family-name:var(--font-display)] text-[1.35rem] font-semibold leading-none tracking-wide ${
                                active ? "text-white" : "text-[#3A2218]"
                              }`}
                            >
                              {link.label}
                            </span>
                            <span
                              className={`mt-1 font-[family-name:var(--font-nunito)] text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                active ? "text-white/55" : "text-[#7A6254]"
                              }`}
                            >
                              {linkHint(link.href)}
                            </span>
                          </span>
                          {active && (
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-[#C62A1E]"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`grid size-11 place-items-center rounded-full transition-colors lg:hidden ${
          light
            ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            : "bg-[#3A2218]/6 text-[#3A2218] hover:bg-[#3A2218]/10"
        }`}
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <List size={24} weight="bold" />
      </button>
      {overlay}
    </>
  );
}
